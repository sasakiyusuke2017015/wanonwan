---
paths:
  - "apps/web/app/**"
  - "apps/web/lib/auth/**"
  - "apps/web/middleware.ts"
---

# 認可パターン

wanonwan の認可は **3 層**。入口で認証、API で claims 取得、行レベルは RLS が最終ガード
（[CLAUDE.md](../../CLAUDE.md) 絶対方針）。DB アクセスの書き方は [data-access.md](./data-access.md)。

| 層 | 実装 | 責務 |
|---|---|---|
| 経路 | [middleware.ts](../../apps/web/middleware.ts) | `PUBLIC_PATHS`（/login /ui-demo）以外は access cookie の JWT を検証。force-change 中は /change-password のみ許可 |
| API | [lib/auth/route.ts](../../apps/web/lib/auth/route.ts) の `withActiveUser` | 401（未認証）と 403（force-change 中）を弾き、handler に `claims` を渡す |
| 行 | RLS（[migrations/0001_initial.sql](../../packages/db/migrations/0001_initial.sql) の `app.current_user_id()` / `app.is_admin()` 等） | ロール判定を含む行レベル認可。違反は 42501 |

## API Route の標準形

```ts
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateXxxSchema);
  if (parsed instanceof NextResponse) return parsed;
  try {
    const rows = await withUser(claims.sub, (tx) => tx`insert ...`);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e); // RLS 違反(42501) → 403
  }
});
```

- **claims は `withActiveUser` 経由でしか得られない**。ガードの書き忘れ = 認可漏れを
  構造的に防ぐ設計（route.ts 冒頭コメント参照）
- **admin 判定はラッパに持ち上げず RLS に任せる**。各業務テーブルの `<table>_write` ポリシー
  （`USING (app.is_admin())`。[0001_initial.sql](../../packages/db/migrations/0001_initial.sql) で
  テーブル一括生成）に違反すると 42501 になり、`mapDbError` が 403 に変換する
- ラッパ不使用の allowlist は **auth/me と auth/change-password のみ**
  （rate-limit を最外に保つ等の理由。route.ts 末尾コメント）。新しい route で
  `getCurrentClaims()` を直接呼ばない

## 未認証エンドポイントはレートリミット必須

未認証で叩ける auth 系（login / refresh / change-password）は
`checkRateLimit`（[lib/auth/rate-limit.ts](../../apps/web/lib/auth/rate-limit.ts)）を
**最外**に置く。ゲート順序は 429 → 401 → 400
（[change-password/route.test.ts](../../apps/web/app/api/v1/auth/change-password/route.test.ts) が順序を固定）。

## 画面側は「表示ガード」のみ

UI は client component で、認可はしない。
[(admin)/layout.tsx](../../apps/web/app/%28admin%29/layout.tsx) のガードは誤操作防止の
**表示ガード**であり、実認可は API + RLS が保有ロールで担保する（同ファイル冒頭コメント）。

## ロールと視点

- ロールは admin / interviewer / member の **union 判定**（member は全員が暗黙保有。
  [CLAUDE.md](../../CLAUDE.md) ドメイン節）
- `active-role` cookie（/api/v1/auth/active-role）は **視点切替**。認可境界ではない
  （admin 保有者が member 視点でも、API の可否は保有ロールで決まる）

## NG 例

```ts
// NG: ラッパを迂回して claims を直接取る（allowlist 2 route 以外で禁止）
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  // force-change ガード漏れ・401 文言のばらつきが起きる
}

// NG: admin 判定をアプリ側の if 文で自作する
if (!roles.includes("admin")) return forbidden(); // RLS と二重管理になり、ズレたら片方が嘘になる
// → write 系は RLS ポリシーに任せ、42501 を mapDbError で 403 にする
```
