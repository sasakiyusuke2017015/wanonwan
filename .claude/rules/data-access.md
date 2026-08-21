---
paths:
  - "apps/web/app/api/**"
  - "apps/web/lib/db/**"
  - "apps/web/lib/api/**"
  - "packages/db/**"
---

# データアクセス規約

DB アクセスは必ず API 経由（[CLAUDE.md](../../CLAUDE.md) 絶対方針）。その API 層の書き方。

## (a) 呼び出し経路

| 呼び出し元 | 手段 |
|---|---|
| Client Component（UI は原則これ） | [lib/api/client.ts](../../apps/web/lib/api/client.ts) の `apiGet` / `apiSend` + TanStack Query で `/api/v1/*` を叩く |
| API Route Handler | [lib/db/client.ts](../../apps/web/lib/db/client.ts) の `withUser` で tx を開く |
| worker（pgmq consumer） | `apps/worker` が自前接続（web の lib/db は使わない） |

現状 **Server Component から `@/lib/db` を import している箇所はゼロ**。新設する場合も
client component からの import は禁止（`server-only` が physical guard）。

## (b) RLS ユーザーコンテキスト（最重要）

業務テーブルへのクエリは **必ず `withUser(claims.sub, fn)` の tx 内**で発行する。

```ts
const rows = await withUser(claims.sub, (tx) => tx`
  select ... from public.surveys where ...
`);
```

- `withUser` はトランザクション内で `set_config('app.user_id', <gotrue sub>, true)` を実行し、
  RLS の `app.current_user_id()` がこのユーザーを参照する（[client.ts](../../apps/web/lib/db/client.ts)）
- sub 未設定なら **RLS は fail-closed**（何も見えない）。「withUser を通し忘れたら 0 行」で
  事故が漏洩側に倒れない
- 素の `sql()` プールを直接使わない。ポリシー判定（admin 等）は RLS 側にある
  （[auth-patterns.md](./auth-patterns.md)）

## (c) SQL の書き方

- postgres.js の**タグ付きテンプレート**のみ。文字列連結・`sql.unsafe` は使わない
- JSON 列は `tx.json(value)`、列名の camelCase 変換は `as "camelName"` で SELECT 側で行う
- スキーマ変更は `packages/db/migrations` + `pnpm db:snapshot`（CI の Snapshot drift check が
  再生成忘れを検出）。RLS を触ったら pgTAP（`packages/db/tests`）を同じ PR に含める
  （[tdd-workflow](../skills/tdd-workflow/SKILL.md)）

## (d) 入力バリデーション

body は `parseBody(req, Schema)`（[lib/api/request.ts](../../apps/web/lib/api/request.ts)）で
検証する。Schema は `@wanonwan/domain` の valibot schema を使う。失敗は 400 Response が
返るので `instanceof NextResponse` で早期 return。

## (e) エラーマスキング

DB 例外は [lib/db/errors.ts](../../apps/web/lib/db/errors.ts) で HTTP に変換する。
SQL・スキーマ・テーブル名をクライアントに出さない。

| PG code | 変換 |
|---|---|
| 42501（RLS 違反） | 403「権限がありません」 |
| 23505（一意制約） | 409 |
| 23503（FK。INSERT/UPDATE） | 400「参照先が存在しません」 |
| 23503（FK。DELETE は `mapDeleteError`） | 409「他のデータから参照されているため削除できません」 |

## (f) IDOR を作らない

- 自分のデータは `/api/v1/me/*` に集約（例: `/api/v1/me/surveys`）。クエリは
  `app.current_user_id()` ベースの RLS が絞る
- userId を URL / body で受け取って本人確認に使わない。本人は常に `claims.sub` 由来
