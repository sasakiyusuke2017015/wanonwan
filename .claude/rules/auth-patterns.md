---
paths:
  - "apps/web/src/app/**"
  - "apps/web/src/lib/auth/**"
---

# 認可パターン

`apps/web/src/app/(app)/**/page.tsx` と `(app)/layout.tsx` の **冒頭認可ブロック** に何を書くか。同じ用途には同じ helper を使うことで、入口認可の基準を 1 箇所に集約する。

> 本ファイルは **page.tsx / layout / Server Action の冒頭認可** が責務。DB アクセス層の規約 (userId 由来 / 動的 SQL 禁止 / URL 命名規約 等) は [`data-access.md`](./data-access.md) に集約。

## helper 一覧

| helper | 用途 | 戻り値 |
|---|---|---|
| `requireSessionUser()` ([require-session.ts](../../apps/web/src/lib/auth/require-session.ts)) | session + user を取得 (role 制約なし) | `{ session, user }` (両方 non-null + `user.status='active'` 保証) |
| `requireActiveRolePage([codes])` ([role-guard.ts](../../apps/web/src/lib/auth/role-guard.ts)) | role 制約あり (page 用) | `void`、role 不一致なら `/dashboard` redirect |
| `requireActiveRoleApi([codes])` ([role-guard.ts](../../apps/web/src/lib/auth/role-guard.ts)) | role 制約あり (API Route 用) | `NextResponse \| null`、不一致なら 401/403 |
| `resolveEffectiveActiveRoleCode(opts?)` ([role-guard.ts](../../apps/web/src/lib/auth/role-guard.ts)) | DB 突合済み effective active role を返す | `number \| null` |
| `redirectToRoleHome(activeRoleCode)` ([role-guard.ts](../../apps/web/src/lib/auth/role-guard.ts)) | active role に応じた "ホーム" へ redirect | `never` |

`require-session.ts` は **role 制約なし helper**、`role-guard.ts` は **role 制約あり helper** という分担。

## 5 パターン

### パターン A: 受講者専用画面 (例: `/dashboard`)

200 (受講者) のみ閲覧可、200 以外は role 別の "ホーム" に振り分ける。

```ts
// apps/web/src/app/(app)/dashboard/page.tsx
const { session, user } = await requireSessionUser()
const userRoleCodes = await listUserRoleCodes(user.id)

const activeRoleCode = await resolveEffectiveActiveRoleCode({
  session,
  user,
  userRoleCodes,
})
if (activeRoleCode !== 200) {
  redirectToRoleHome(activeRoleCode) // never
}

// ここから 200 受講者として処理
```

### パターン B: 複数 role 許容画面 (例: `/portfolio` `/points`)

複数 role を allowlist で許可。role 不一致は `/dashboard` に redirect。

```ts
// apps/web/src/app/(app)/portfolio/page.tsx
await requireActiveRolePage([200])
// または: await requireActiveRolePage([200, 300, 900])
```

### パターン B-2 (E): role 不問 / session 必須 / 自分のデータのみ (例: `/certifications/me` `/exams/history`)

session さえあれば誰でも見れる画面 (DB クエリ側で `WHERE user_id = ${session.userId}` で自分のデータに絞る)。

```ts
// apps/web/src/app/(app)/certifications/me/page.tsx
const { user } = await requireSessionUser()
const certs = await listCertificationsForUser(user.id)
```

`requireActiveRolePage([200, 300, 400, 900])` のように全 role を列挙するのは冗長なので **使わない**。「session があれば OK」の意図を `requireSessionUser()` 単体で表現する。

### パターン C: admin API 専用 (例: `/api/v1/users/:id`)

API Route で role 制約をかける。

```ts
// apps/web/src/app/api/v1/users/[id]/route.ts
export async function GET(req: NextRequest, { params }: ...) {
  const guard = await requireActiveRoleApi([900])
  if (guard) return guard // 401 / 403 をそのまま返す
  // 認可済み処理
}
```

### パターン D: グループ layout (例: `(app)/layout.tsx`)

layout で session + user を取り、配下 page で `requireSessionUser()` を再度呼んでも `react.cache()` で memoize されて DB 呼び出しは増えない。

```ts
// apps/web/src/app/(app)/layout.tsx
const { session, user } = await requireSessionUser()
const availableRoleCodes = await listUserRoleCodes(user.id)
// NAV / Sidebar / avatar URL 等の組み立て
```

## NG 例

以下のパターンは **使わない**。すべて util に置き換える。

### (a) page.tsx で `getSessionUser` 単体呼び出し

```ts
// NG
const session = await getSessionUser()
if (!session) redirect('/login')
const user = await findUserByGotrueId(session.gotrueId)
if (!user) redirect('/login')
```

→ パターン A〜D で挙げた `requireSessionUser()` / `requireActiveRolePage()` を使う。`user.status='active'` チェック漏れも防げる。

### (b) Server Action で `findUserByGotrueId` 直叩き

```ts
// NG: actions/some-action.ts
'use server'
export async function someAction() {
  const session = await getSessionUser()
  if (!session) throw new Error('unauthenticated')
  const user = await findUserByGotrueId(session.gotrueId)
  // ...
}
```

→ `const { user } = await requireSessionUser()` を使う。

### (c) API Route で session だけ取って user lookup なし

```ts
// NG: api/v1/me/something/route.ts
export async function GET() {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  // session.gotrueId をそのまま DB クエリに使う ← user.status='active' チェック漏れ
}
```

→ `requireActiveRoleApi([...])` または `requireSessionUser()` を経由する。

### (d) layout で `requireSessionUser` を呼ばずに個別取得

```ts
// NG: (app)/layout.tsx
const session = await getSessionUser()
if (!session) redirect('/login')
const user = await findUserByGotrueId(session.gotrueId)
if (!user) redirect('/login')
```

→ `requireSessionUser()` 1 行に置き換える。

## `react.cache()` の per-request scope

`requireSessionUser` は `react.cache()` でラップされており、同一 React レンダリング内で memoize される。layout で呼んだ後 page で呼んでも DB 呼び出しは 1 回しか走らない。

注意事項:

1. **同一 React レンダリングツリー内の単一リクエスト** で memoize される (Next.js [Request Memoization](https://nextjs.org/docs/app/building-your-application/caching#request-memoization))
2. **リクエスト境界を越えて値が漏れない** — 異なる cookie / 異なるユーザー間で cache 共有なし
3. **Server Action や Route Handler 経路は別の React レンダリングコンテキスト** として扱われる場合があり、layout で取った値の cache を踏まないケースがある。実害は「DB 呼び出しが 1 回多く走る」程度で安全側
4. **引数を取らせない**。`requireSessionUser` は引数なしで全呼び出しを同一 cache key にする運用。将来引数を足す場合は primitive のみ (cache key の identity 比較は `===`)

## `redirect()` の `never` narrow

`redirect()` の戻り型は Next.js 16 で `never`。早期 return の代わりに使え、後続の null check が不要になる。

```ts
const session = await getSessionUser()
if (!session) redirect('/login')
// ここで session は SessionUser に narrow される (null ではない)
const user = await findUserByGotrueId(session.gotrueId)
```

`requireSessionUser` 内部もこの narrow を活用している。

## lint での物理ブロックは別 Plan

本 Rule は **コードレビューで担保**する規約集。ESLint の `no-restricted-imports` / `no-restricted-syntax` 等で NG 例 (a)〜(d) を物理ブロックする話は別 Plan ([data-access.md](./data-access.md) (d) と統合可能)。本 Plan には含めない。

## 関連 Rule

- [data-access.md](./data-access.md) — DB アクセス層の規約 (userId 由来 / 動的 SQL 禁止 / URL 命名規約 / RLS 実態)
- [security.md](./security.md) — コミット前セキュリティチェック
- [coding-style.md](./coding-style.md) — イミュータビリティ / ファイル構成 / エラーハンドリング
