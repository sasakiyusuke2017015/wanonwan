---
paths:
  - "apps/web/src/app/api/**"
  - "apps/web/src/app/**/*.tsx"
  - "apps/web/src/app/**/*.ts"
  - "apps/web/src/lib/db/**"
  - "apps/web/src/lib/auth/**"
  - "packages/db/sql/**"
  - "packages/db/queries/**"
  - "packages/db/src/**"
---

# データアクセス規約

DB アクセス層 (`apps/web/src/lib/db/*` / `/api/v1/*` / Server Action) を **どこから / どう呼ぶか** のルール。技術選定メモ [M-0637](../../docs/02_設計/技術選定メモ.csv) の 2026-05-22 B 案緩和を実装レベルで具体化する。

> 本ファイルが言及する **「Server 側」 = Server Component / Server Action / pg_cron Job / 単体スクリプト**。**「Client 側」 = `'use client'` 指定のあるコンポーネント** (ブラウザ実行コード) を指す。

## (a) Server 側 / Client 側の使い分け

| 呼び出し元 | DB アクセス手段 |
|---|---|
| Server Component (`apps/web/src/app/**/*.tsx` で `'use client'` 無し) | `@/lib/db/*` を直接 import して呼ぶ |
| Server Action | `@/lib/db/*` を直接 import して呼ぶ |
| pg_cron / バッチジョブ | `@/lib/db/*` を直接 import して呼ぶ (将来 Node 側でジョブを書く場合) |
| API Route Handler (`apps/web/src/app/api/**/route.ts`) | `@/lib/db/*` を直接 import して呼ぶ |
| Client Component (`'use client'` 指定あり) | **`fetch('/api/v1/*')`** 経由のみ。`@/lib/db/*` を import してはならない |

Server 側からは API を **fetch せず** `@/lib/db/*` を直呼びする。Server Component から自分自身の API を fetch すると HTTP 往復 + cookie 転送のオーバーヘッドだけ発生し、認可は同じ session で 2 回走り、TS 型は any 化する。Server / DB は同一プロセス内なので直呼びが正解。

## (b) userId 由来規約

`@/lib/db/*` 関数の `userId` 引数は、**呼び出し側で `getSessionUser()` → `findUserByGotrueId()` 経由で取得した値**のみを渡す。

```ts
// OK: session 由来の userId
const session = await getSessionUser()
if (!session) redirect('/login')
const user = await findUserByGotrueId(session.gotrueId)
if (!user) redirect('/login')
const summary = await getDashboardSummary(user.id)

// NG: URL/query/header/body 由来の userId
const userId = Number(searchParams.get('userId'))  // ← IDOR
const summary = await getDashboardSummary(userId)
```

API Route Handler では `requireActiveRoleApi([...])` の戻り値から `user.id` を使う。URL path param に `{userId}` を出さない (詳細は (g))。

## (c) 動的 SQL 禁止

新規追加する SQL は **すべてタグ付きテンプレート** で書く。文字列連結による SQL 構築は禁止。

```ts
// OK
sql`SELECT * FROM courses WHERE user_id = ${userId} AND status = ${status}`

// NG
sql.unsafe(`SELECT * FROM courses WHERE user_id = ${userId}`)
```

`sql.unsafe(...)` を新規追加する場合は PR 説明に理由を明示する (動的な ORDER BY 列名など、tagged template で表現できない場合のみ)。

既存の `sql.unsafe` 利用箇所 ([apps/web/src/lib/db/client.ts:86-91](../../apps/web/src/lib/db/client.ts#L86) の instrumentation 等) は本ルール導入時点で凍結。棚卸しは別 Plan で扱う (新規 / 既存に関わらず attacker-controlled でないことを 1 箇所ずつ確認)。**本ルールは新規追加にのみ適用**。

## (d) Client から `@/lib/db/*` import 禁止

`'use client'` 指定のあるファイルから `@/lib/db/*` を import してはならない。当面はコードレビューで担保する。将来 `eslint-plugin-import` の `no-restricted-imports` ルールで物理ブロックする予定 (別 Plan)。

```ts
// apps/web/src/components/Dashboard.tsx
'use client'
import { getDashboardSummary } from '@/lib/db/dashboard'  // ← NG (lint で落とす予定)
```

Client から DB のデータを取得したい場合は `fetch('/api/v1/me/dashboard')` 経由で取る。

## (e) エラーマスキング

DB 例外を Client 側に返すとき、内部 SQL / スキーマ / テーブル名 / カラム名を露出させない。

```ts
// API Route Handler 内
try {
  const summary = await getDashboardSummary(user.id)
  return NextResponse.json({ success: true, data: summary })
} catch (error) {
  log.error('dashboard.summary failed', { error, userId: user.id })
  return NextResponse.json(
    { success: false, error: 'ダッシュボード情報の取得に失敗しました' },
    { status: 500 },
  )
}
```

詳細は [apps/web/src/lib/log/logger.ts](../../apps/web/src/lib/log/logger.ts) 経由で structured log に逃がす。ユーザー向けは generic メッセージのみ。

## (f) PII / SQL ログ抑制

[apps/web/src/lib/db/client.ts:51-75](../../apps/web/src/lib/db/client.ts#L51) の `tapQuery` は **SQL 本体 / params を構造化ログに出さない方針**。新規クエリ関数を作るときもこの方針を踏襲する。PII (email / 認定 ID / 社員番号など) を直接ログに出さない。`log.info('user.lookup', { userId })` のように **ID は OK、PII は NG**。

## (g) URL 命名規約 (`/api/v1/me/*` 強制)

自分自身のデータを返す API は **`/api/v1/me/*` パターン**で実装する。

| 用途 | URL パターン | 認可 |
|---|---|---|
| 自分のデータを取得 / 更新 | `/api/v1/me/<resource>` | `requireActiveRoleApi([200, 300, 400, 900])` 等、認証済み + 該当ロール |
| 管理者が他ユーザーのデータを操作 | `/api/v1/users/{userId}/<resource>` | `requireActiveRoleApi([900])` 必須 |
| 一般ユーザーが `{userId}` を URL に渡す API | **禁止** (IDOR の温床) | — |

`/api/v1/me/dashboard`, `/api/v1/me/courses`, `/api/v1/me/notifications` のように `me/` 配下に集約することで、IDOR ([Insecure Direct Object Reference](https://owasp.org/www-community/Top_10/A01_2021-Broken_Access_Control)) の経路自体を作らない。

## (h) 判定パラメータも server-trusted source 限定

期限・閾値・フラグ・ロール判定など、**ビジネスロジックの判定に使う値**は `process.env` または定数のみから取得する。`searchParams` / Cookie / Header / Body から受け取ってはならない (受け取って良いのは「表示用のフィルタ条件」「ページング」「ソートキー」など、攻撃者が値を操っても認可境界を越えない範囲のみ)。

```ts
// OK
const WARNING_DAYS = 90
const ERROR_DAYS = 30

// OK (.env 経由、デプロイ時に固定)
const enableExperiment = process.env.NEXT_PUBLIC_FEATURE_X === 'true'

// NG (searchParams 経由)
const warningDays = Number(searchParams.get('warn_days') ?? 90)  // ← 攻撃者が ?warn_days=99999 で常時警告 / =0 で警告非表示にできる
```

## (i) RLS 実態の注記

[packages/db/sql/12_rls_new_tables.sql:5-8](../../packages/db/sql/12_rls_new_tables.sql#L5-L8) のコメントどおり、現状アプリは `app` ロールで DB 接続するが、`SET LOCAL ROLE app_user` も `SET LOCAL app.current_user_id = <session.userId>` も呼ばない。結果として `app.is_admin()` が常時 true となり、**RLS は事実上バイパス状態**。

そのため、本規約 (b) (c) (g) (h) は **RLS が効かない前提**で守ること。安全マージンは「入口認可 (`requireActiveRolePage` / `requireActiveRoleApi`) + クエリの `WHERE user_id = ${session.userId}` フィルタ」の 2 段のみ。`SET LOCAL` を導入して RLS を真に二重防御化する別 Plan を後続で立てる ([outputs/plans/2026-05-22-2102-p0089-examinee-dashboard.md](../../outputs/plans/2026-05-22-2102-p0089-examinee-dashboard.md) の関連 Plan §RLS を真に二重防御化 を参照)。それまでは「`WHERE user_id` を書き忘れたら即漏洩」というつもりでクエリを書く。
