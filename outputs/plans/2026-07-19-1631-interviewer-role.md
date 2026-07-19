# Plan: マルチロール権限（admin / interviewer / member）とメニューからのロール切替

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-19 16:31 JST（17:00 マルチロール化で全面改訂） |
| 担当 | Claude Code + 笹木さん |
| ブランチ | PR1: `feature/multi-role` / PR2: `feature/role-switcher` |
| 関連 PR | PR1: [#98](https://github.com/sasakiyusuke2017015/waoon/pull/98) / PR2: TBD |
| レビュー | 改訂前版: [1643-review](../reviews/2026-07-19-1643-interviewer-role-review.md)（APPROVE）/ 改訂版: [1701-review](../reviews/2026-07-19-1701-interviewer-role-review.md)（BLOCKER 4 論点 → 全反映済み） |

## 目的

権限を 3 種類にし、**1 ユーザーが複数の権限を同時に保有**できるようにする。保有ロールは
ヘッダーメニューから**表示モードとして切り替え**られる。

| 表示名（想定） | role 値 | できること |
|---|---|---|
| メンバー | `member` | 自分のアンケート回答。自分が当事者の面談内容の閲覧。**全ユーザーが暗黙に保有** |
| 面談担当 | `interviewer` | 上記に加え、**自分が担当に割り当てられた回答**の面談記録 |
| 管理者 | `admin` | 全操作。アンケート/設問/組織マスタ作成、ユーザー管理、面談担当の割り当て |

例: 笹木さんは `admin` + `interviewer` を保有し、メニューで「管理者」「面談担当」「メンバー」
の視点を切り替えて使う。

### 認可の基本整理（本 Plan の背骨）

1. **認可境界 = 保有ロールの集合（union）**。RLS・API 層の認可は「そのロールを保有しているか」
   で判定する。
2. **アクティブロール = 表示状態**。ナビ・画面の出し分けと誤操作防止のための UI/API 表示層の
   状態であり、**セキュリティ境界ではない**（本人がいつでも切り替え可能なため、切替を認可に
   使っても防御にならない。GUC で RLS まで通す配管は複雑さに見合わない）。
3. **`interviewer` ロール = 「面談機能を使える人か」の capability ゲート**（UI 導線・API 層）。
   **`answers.interviewer_id` = 「この回答の担当は誰か」の行単位割り当て**（RLS が per-answer で
   判定）。両方必要。「interviewer ロールを持つ = 全回答が見える」では**ない**。

## スコープ

### やる

1. **`user_roles` 中間表の新設**と `users.role` 列の**廃止**（FailFast・一括移行）。
   `member` は全員が暗黙保有とし、`user_roles` には**上位ロール（`admin` / `interviewer`）のみ**格納。
2. RLS の追随: `app.is_admin()` の参照先変更、`user_roles` の RLS、
   `prevent_last_admin_removal` トリガの移設。
3. domain スキーマ: `role: picklist` → `roles: array` への変更。users API（GET/POST/PUT）の追随。
4. `/admin/users`（UserForm）: role 単一 Select → 「管理者」「面談担当」チェックボックスへ。
5. **ロール切替メニュー**: `/me` に `roles[]` + `activeRole` を追加、
   `PUT /api/v1/auth/active-role`（cookie）、ヘッダーメニューの切替 UI、ナビ・画面ガードの
   activeRole 追随。
6. admin が面談担当を指名/解除する API（`PUT /api/v1/answers/[id]/interviewer`）+
   admin 面談画面への担当者選択 UI。
7. 面談担当向け画面導線: 「自分が担当の回答」一覧 + 面談記録（`(admin)` 配下の外）。
8. ドキュメント負債の解消（`CLAUDE.md` の 5 段階 role 記述、`20_org.sql` の旧コメント）。
9. 関連テスト（pgTAP / Vitest）の追加・全面更新。

### やらない（residual として明記）

- **アクティブロールの認可への反映**（GUC で RLS に流す等）。表示状態に留める（上記整理 2）。
- **役職階層に基づく RLS 可視範囲**（課長→部下が見える 等）。別 Plan 送りのまま。
- **面談閲覧者（`answer_viewers`）の割り当て UI/API**。RLS 済みだが未実装のまま。
- **面談候補（`answer_interview_candidates` / `user_interview_candidates`）**。未使用のまま残す。
- schedules と answers の紐付け。

## 現状コンテキスト

### role の現状（廃止対象）

- SQL: [30_users.sql:13](../../packages/db/schema/30_users.sql#L13) — `role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member'))`（単一値）+ [:24-31](../../packages/db/schema/30_users.sql#L24-L31) の冪等 ALTER。
- TS: [packages/domain/src/user.ts:4](../../packages/domain/src/user.ts#L4) — `v.picklist(["admin", "member"])`。
- `users.role` を読むコード: [90_rls_helpers.sql:10-19](../../packages/db/schema/90_rls_helpers.sql#L10-L19)（`app.is_admin()`）、[99_rls.sql:64-81](../../packages/db/schema/99_rls.sql#L64-L81)（最後の admin 防止トリガ）、[users/route.ts](../../apps/web/app/api/v1/users/route.ts)（GET select / POST insert）、[users/[id]/route.ts](../../apps/web/app/api/v1/users/%5Bid%5D/route.ts)（GET / PUT）、[UserForm.tsx:50-51](../../apps/web/components/admin/UserForm.tsx#L50-L51)、pgTAP フィクスチャ（`rls_role_admin.test.sql` 等）。**列廃止時に全て追随が必要**（実装時に `grep -rn "\brole\b"` で全数確認する）。

### セッション・RLS コンテキストの現状

- RLS コンテキストは [lib/db/client.ts:14-22](../../apps/web/lib/db/client.ts#L14-L22) の `withUser()` が tx 内 `set_config('app.user_id', <gotrue sub>, true)` で注入。認可ラッパは [lib/auth/route.ts:16](../../apps/web/lib/auth/route.ts#L16) の `withActiveUser`（admin 判定は各 route の tx 内）。
- セッションは GoTrue JWT を httpOnly cookie に保持（[lib/auth/session.ts](../../apps/web/lib/auth/session.ts)）。**アクティブロール cookie も同じ流儀（httpOnly / sameSite lax）で追加**する。
- `/me`（[auth/me/route.ts](../../apps/web/app/api/v1/auth/me/route.ts)）は `isAdmin` / `userId` / `name` を返す。既存の `user.role` は GoTrue JWT の role（常に `authenticated`）で**業務ロールとは別物**。業務側はトップレベルに置き混同しない。
- nav 出し分けは [navItems.ts:9](../../apps/web/components/layout/navItems.ts#L9) の `adminOnly` + [useNavigationItems.ts:34](../../apps/web/components/layout/useNavigationItems.ts#L34) の `isAdmin` のみ。`(admin)` 配下は [layout.tsx:19](../../apps/web/app/(admin)/layout.tsx#L19) が `!isAdmin` でブロック。

### 面談者まわりの現状（改訂前 Plan から不変）

- `answers.interviewer_id`（[60_answers.sql:14](../../packages/db/schema/60_answers.sql#L14)）が回答ごとの担当。RLS は [99_rls.sql:96-110](../../packages/db/schema/99_rls.sql#L96-L110) で per-answer 判定済み（SELECT: admin/本人/担当/viewer、UPDATE: admin/本人/担当）。
- `interviewer_id` を書くのは [interview/route.ts:36](../../apps/web/app/api/v1/answers/%5Bid%5D/interview/route.ts#L36) の `coalesce(interviewer_id, app.uid())`（admin self-claim）のみ。**他人を指名する API/UI は存在しない**。
- 面談画面は `(admin)` 配下にあり、非 admin は到達不可。
- 計画レビュー（改訂前版）で裏取り済みの事実: 面談者自身による interviewer_id 付け替えは RLS WITH CHECK が拒否 / respondent の interviewer_id 書き換えは RLS 上可能だが現 API 経路では到達不可（列レベル保護なし）/ answers 系 GET は admin ゲートなしのため RLS 自動フィルタで interviewer 向け一覧が API 変更ゼロで成立。

### ドキュメント負債（実装と乖離、evergreen 違反）

- [CLAUDE.md:67-68](../../CLAUDE.md#L67-L68) — 「ロールは組織階層 5 段階」← 旧設計。
- [20_org.sql:2](../../packages/db/schema/20_org.sql#L2), [:26](../../packages/db/schema/20_org.sql#L26) — 「役職コードが権限ロールを決める」← 旧設計。

## 実装計画

> **PR 分割**: PR1 = マルチロール基盤（Phase 1〜4, 8）/ PR2 = ロール切替メニュー + 面談担当フロー（Phase 5〜7）。PR1 merge 後は「複数ロールを付与できるが切替メニューが無い」中間状態（既定 = 最上位ロール表示で従来同等に動く）。

### Phase 1 — `user_roles` 新設 + `users.role` 廃止（schema）

- [30_users.sql](../../packages/db/schema/30_users.sql) に追加:
  ```sql
  -- 上位ロールのみ格納。member は全ユーザーが暗黙保有（行なし = member のみ）。
  CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role    text   NOT NULL CHECK (role IN ('admin', 'interviewer')),
    PRIMARY KEY (user_id, role)
  );
  ```
- **一括移行（真に冪等にする）**: schema は再適用される前提のため、移行ブロック全体を**列存在ガード**で囲む（素の INSERT→DROP だと 2 回目適用時に `WHERE role='admin'` が存在しない列を参照して落ちる）:
  ```sql
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='users' AND column_name='role') THEN
      INSERT INTO public.user_roles (user_id, role)
        SELECT id, 'admin' FROM public.users WHERE role = 'admin'
        ON CONFLICT DO NOTHING;
      ALTER TABLE public.users DROP COLUMN role;
    END IF;
  END $$;
  ```
  （`member` 行は移行不要 = 暗黙保有）。既存の `users_role_check` 冪等ブロック（[30_users.sql:24-31](../../packages/db/schema/30_users.sql#L24-L31)）は削除。pgTAP に「schema 2 回適用でも成功」を含める。
- **seed / provisioning スクリプトの追随（列廃止で壊れる箇所）**:
  - [scripts/seed-from-csv.mjs:165,177,241,244](../../scripts/seed-from-csv.mjs#L165) — users INSERT の `role` 列を除去し、`user_roles` への INSERT に分離。
  - [scripts/provision.mjs:204-273](../../scripts/provision.mjs#L204) — **stg/prod プロビジョニング経路**。users INSERT の `role` 除去 + `role in ('admin','member')` ハード検証の作り直し。
  - [packages/db/seed/csv/users.csv](../../packages/db/seed/csv/users.csv) / [demo_users.csv](../../packages/db/seed/csv/demo_users.csv) — **CSV のロール表現を再設計**: `role` 単一列 → `roles` 列（セミコロン区切り、上位ロールのみ。空 = member のみ）。member 暗黙保有なので CSV に member は書かない規約とする。
- seed: 動作確認用に interviewer 保有ユーザー（および admin+interviewer 複合保有）を追加（pgTAP はこれに依存させない）。

### Phase 2 — RLS の追随

- [90_rls_helpers.sql](../../packages/db/schema/90_rls_helpers.sql):
  - `app.is_admin()` の参照先を `user_roles` へ（`EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON u.id = ur.user_id WHERE u.gotrue_id = app.current_user_id() AND ur.role = 'admin')`）。シグネチャ不変なので**呼び出し側ポリシーは全て無変更**。
  - `app.has_role(p_role text)` を新設（API 層の capability ゲート用。interviewer 判定は `app.has_role('interviewer') OR app.is_admin()`）。GRANT を追加。
  - **blanket 可視化はしない**: answers への per-answer 判定（`interviewer_id = app.uid()`）は不変。
- [00_bootstrap.sql](../../packages/db/schema/00_bootstrap.sql) のスタブ `app.is_admin()` も確認・追随。
- [99_rls.sql](../../packages/db/schema/99_rls.sql):
  - `user_roles` の RLS 追加: SELECT = `app.is_admin() OR user_id = app.uid()`（**自分の保有ロール + admin は全件**。切替メニューは自分の roles しか要らず、「誰が admin か」の名簿を全認証ユーザーへ晒さない）/ WRITE = admin のみ。副作用: 非 admin が users 一覧 GET を叩いた場合、他人の roles は空配列になる（ディレクトリ表示に roles は不要なので許容）。
  - `prevent_last_admin_removal` トリガを **users から user_roles へ移設**: **BEFORE UPDATE OR DELETE** ON user_roles、条件は旧版と同型の `OLD.role = 'admin' AND (TG_OP = 'DELETE' OR NEW.role <> 'admin')` + 残 admin 行 0 で RAISE（PK 列でも UPDATE は可能なため、DELETE のみだと `UPDATE ... SET role='interviewer'` でバイパスできてしまう）。users 行 DELETE の CASCADE でも行トリガは発火する。users 側の旧トリガ・旧関数は削除。

### Phase 3 — domain + users API + UserForm

- [packages/domain/src/user.ts](../../packages/domain/src/user.ts): `UserRoleSchema` は 3 値 picklist として残し（表示・切替で使用）、`UserSchema.role` → `roles: v.array(ElevatedRoleSchema)`（`admin`/`interviewer`）。`CreateUserSchema`/`UpdateUserSchema` も `roles` へ。
- [users/route.ts](../../apps/web/app/api/v1/users/route.ts): GET は `array_agg` で roles を返す。POST は user insert 後に `user_roles` へ insert（同一 tx。admin ゲートは既存どおり + RLS user_roles_write が最終ガード）。
- [users/[id]/route.ts](../../apps/web/app/api/v1/users/%5Bid%5D/route.ts): PUT で roles を**差分適用**する（現在保有と新セットを比較し、除去分のみ DELETE・追加分のみ INSERT。同一 tx）。**全置換（DELETE→INSERT）にしない**: 唯一の admin が admin を維持したまま他ロールを編集するケースで、admin 行の DELETE 時点で保護トリガが発火し誤ロックされるため。実際に admin を剥奪する差分のときだけトリガが拒否 → mapDbError で 409/422 相当に変換。
- [UserForm.tsx](../../apps/web/components/admin/UserForm.tsx): 単一 Select → 「管理者」「面談担当」チェックボックス（`@ui-catalog/core` の既存 Checkbox を使用。無ければ /ui-absorb 検討）。

### Phase 4 — 面談担当の指名 API + admin UI（PR1）

- 新規 `PUT /api/v1/answers/[id]/interviewer`。Body: `{ interviewerId: number | null }`（`AssignInterviewerSchema`）。
- 認可: **admin 限定**（tx 内 `app.is_admin()` → 403。RLS `answers_update`(admin) が最終ガード）。
- **TOCTOU 対策**: 指名先の capability 検証と UPDATE を単一 SQL でアトミックに:
  `update answers set interviewer_id = $1 where id = $2 and ($1 is null or exists (select 1 from user_roles where user_id = $1 and role in ('interviewer','admin')))`。affected rows = 0 → 404/422。
- 呼び出し元 UI: admin 面談画面 `(admin)/admin/answers/[id]/page.tsx` に担当者 Select（interviewer/admin 保有者を候補表示）。orphaned endpoint を merge しない。
- self-claim（coalesce）は残す。respondent 本人の自己指名は無害なので許容。

### Phase 5 — /me 拡張 + アクティブロール切替 API（PR2）

- [auth/me/route.ts](../../apps/web/app/api/v1/auth/me/route.ts): `roles`（保有 = `['member', ...user_roles]`）と `activeRole` を追加。`isAdmin` は当面併存（`= roles.includes('admin')`）。業務ロールはトップレベル、GoTrue JWT の `user.role` はそのまま（混同しない）。
- 新規 `PUT /api/v1/auth/active-role`: Body `{ role }` を保有ロールと突き合わせて検証し、cookie `waoon_active_role` に保存（不正値は 422）。cookie 属性は [session.ts](../../apps/web/lib/auth/session.ts) の `baseCookie` を再利用（httpOnly / sameSite lax / secure）— JS から書き換えて UI を騙す余地を消す。
- **不変条件**: `/me` は cookie 値を信頼せず、**毎回保有ロール集合と突き合わせて検証し、非包含なら破棄**して最上位保有ロール（admin > interviewer > member）へフォールバックする（単なる利便フォールバックではなくセキュリティ上の必須動作。実装コメントに明記）。
- アクティブロールは**表示状態**。API の認可判定には使わない（判断ログ参照）。

### Phase 6 — ロール切替メニュー + nav/ガードの追随（PR2）

- ヘッダーのアカウントメニュー（AppLayout シェル）に「視点切替」を追加: 保有ロールのみ列挙、選択で `PUT active-role` → `["me"]` query invalidate → ナビ即時更新。単一保有者にはメニュー自体を出さない。
- [navItems.ts](../../apps/web/components/layout/navItems.ts): `adminOnly` → `roles?: UserRole[]`（表示対象アクティブロール）に一般化。面談担当向け項目（「担当面談」）は `['admin','interviewer']`。
- [useNavigationItems.ts](../../apps/web/components/layout/useNavigationItems.ts): フィルタを `activeRole` ベースへ。`Me` 型に `roles`/`activeRole` 追加。
- [(admin)/layout.tsx](../../apps/web/app/(admin)/layout.tsx): ガードを `activeRole === 'admin'` に（誤操作防止。**securityは従来どおり API+RLS が担保**）。メンバー視点に切り替えた admin には「管理者視点に切り替えてください」の案内を表示。

### Phase 7 — 面談担当向け画面（PR2）

- `app/interviews/`（`(admin)` 外・AppFrame シェル配下）に「自分が担当の回答」一覧 + 詳細を新設。一覧は既存 answers 系 GET を利用（admin ゲートなし + RLS `interviewer_id = me` 自動フィルタで API 変更ゼロ。改訂前レビューで裏取り済み）。
- 詳細で既存 `InterviewForm` を再利用（`(admin)` 依存があれば components へ切り出し）。
- 画面ガード: `activeRole ∈ {admin, interviewer}`（表示）+ 面談記録 PUT の既存 API 認可（実効）。

### Phase 8 — ドキュメント負債の解消（PR1）

- [CLAUDE.md:67-68](../../CLAUDE.md#L67-L68): 現行モデル（member 暗黙 + user_roles の admin/interviewer、切替はメニュー）へ書き換え。
- [20_org.sql:2](../../packages/db/schema/20_org.sql#L2), [:26](../../packages/db/schema/20_org.sql#L26): 旧コメント修正（role は `user_roles` が源）。
- [30_users.sql](../../packages/db/schema/30_users.sql) 冒頭コメントの role 記述更新。

## 検証

### pgTAP（`packages/db/tests/`）

fixture は test transaction（BEGIN/ROLLBACK）内で自足させ、seed に依存しない。
`users.role` 列廃止に伴い**既存テストの fixture を全数確認**（`grep -rn "role" packages/db/tests/`）。

- `rls_role_admin.test.sql` 全面改修 or `rls_user_roles.test.sql` 新規:
  - `user_roles` CHECK が `admin`/`interviewer` を受理し `member`/未知値を拒否。
  - admin 行保有者のみ `app.is_admin()` = true。複合保有（admin+interviewer）でも正しく判定。
  - `user_roles` の RLS: 非 admin は書けない（自己昇格不可）。SELECT は自分の行のみ（admin は全件）。
  - `prevent_last_admin_removal`: 最後の admin 行 DELETE を拒否 / **UPDATE（`SET role='interviewer'`）による降格も拒否**（バイパス閉塞）/ users 行 DELETE の CASCADE 経由でも拒否 / admin が 2 人いれば片方は剥奪可 / **唯一の admin が admin を維持したまま他ロール（interviewer）を付け外しできる**（差分適用で誤爆しないこと）。
  - **schema の 2 回適用が成功する**（移行ブロックの冪等性）。
  - interviewer 保有だけでは他人の回答が**見えない**（per-answer 判定の維持）。
  - `interviewer_id` 割り当て済みユーザーは担当回答を SELECT/UPDATE できる。
  - **ロール剥奪後の残留アクセス**: interviewer 行を剥奪しても `interviewer_id` に入ったままの回答は見える/更新できる（仕様として明示的にテスト。判断ログ参照）。
- 既存テストの stale コメント修正: [rls_positions.test.sql](../../packages/db/tests/rls_positions.test.sql) / [rls_urgency_levels.test.sql](../../packages/db/tests/rls_urgency_levels.test.sql) の `role='member'` 前提コメントを user_roles 表現へ（evergreen）。
- `pnpm test:db` で実行。

### Vitest（web）

- `answers/[id]/interviewer/route.test.ts` 新規: admin が interviewer 保有者を指名できる / 非保有者の指名は 422 / 非 admin は 403 / null で解除。
- `auth/active-role/route.test.ts` 新規: 保有ロールへの切替 OK / 非保有ロールは 422 / cookie 設定。
- [auth/me/route.test.ts](../../apps/web/app/api/v1/auth/me/route.test.ts): `.toEqual` 完全一致のため **withUser モック戻り値と期待 JSON の両方**へ `roles`/`activeRole` を追加。
- `users/route.test.ts` 等: `role` 単一値前提のアサート・モックを `roles` へ全面追随。
- domain: `roles` array スキーマのユニットテスト。

### 型・ビルド・E2E 相当

- `pnpm -r typecheck` / `pnpm --filter @waoon/web build`（CI と同じ）。
- **PR1 中間状態の確認**: `/me` が `isAdmin` のみ（roles/activeRole は PR2）の状態で、`app.is_admin()` の参照先切替後も nav・`(admin)` ガードが従来どおり動くこと。
- seed / provisioning 動作確認: `seed-from-csv.mjs` と `provision.mjs` が新 CSV スキーマ（roles 列）で通ること。
- ブラウザ確認（seed 使用）: 複合保有ユーザーで切替メニュー → ナビが変わる / member 視点で `/admin` に入れない（案内表示）/ interviewer 視点で担当一覧だけ見える / admin が担当を指名 → 当該ユーザーで面談記録ができる。

## リスク

| リスク | 影響 | 対策 |
|---|---|---|
| `users.role` 列廃止の波及漏れ（SQL/TS/テスト fixture） | ビルド・テスト・実行時エラー | 実装冒頭に `grep -rn "\brole\b"` で全参照を洗い出しチェックリスト化。FailFast で一括書き換え。typecheck + pgTAP + Vitest を CI 同等に回す |
| 移行順序ミス（DROP COLUMN が INSERT より先） | 既存 admin の権限消失（全員ロックアウト） | 冪等ブロック内で INSERT→DROP を同一ファイル内に順序固定。pgTAP で「移行後も admin が 1 名以上」を検証。dev で再起動テスト |
| アクティブロールを認可と誤解した実装 | 「member 視点なら安全」という誤った前提のコードが混入 | Plan の背骨（認可 = 保有 union / active = 表示）を各 Phase の実装コメントに明記。UI ガードの横に「security は API+RLS」コメント |
| **RLS に列レベル保護がなく、respondent が `interviewer_id`（認可決定列）を書き換え可能** | 将来 respondent 向け UPDATE 経路追加時に面談内容の閲覧権を第三者へ付与できる | 現 API 経路では到達不可。**不変条件**「respondent 向け UPDATE の SET 対象に interviewer_id を含めない」を維持。BEFORE UPDATE トリガは residual 候補 |
| 指名先 capability 検証の TOCTOU | 不整合な指名（非保有者が担当）が通る | Phase 4 の単一 SQL アトミック化 |
| roles 更新と最後の admin 防止トリガの競合（全置換だと admin 維持編集でも DELETE 時点で誤爆） | 唯一の admin が自分のロールを編集できなくなる | PUT は**差分適用**（admin 継続なら admin 行を触らない）。実際に剥奪する差分のみトリガが拒否 → 409/422。pgTAP「唯一 admin の admin 維持編集が成功」で検証 |
| seed / provisioning スクリプトの追随漏れ（users.role INSERT・CSV スキーマ） | stg/prod プロビジョニング（provision.mjs）が起動不能 | Phase 1 に seed-from-csv.mjs / provision.mjs / CSV 再設計を明示。動作確認を検証項目に追加 |
| 切替 UI の cookie とサーバ状態の不整合（ロール剥奪後の stale activeRole） | 剥奪済みロールの視点表示が残る | `/me` が毎回保有ロールと突き合わせ、保有外なら最上位へフォールバック（cookie は上書き） |
| `@ui-catalog/core` に必要な部品（Checkbox / メニュー項目）が無い | UI 実装が滞る | 事前確認し、無ければ ui-catalog へ吸収（絶対方針: 使い捨て部品を作らない） |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-19 | （改訂前）1 ユーザー 1 role の 3 値 picklist 拡張で計画 | 2026-06-25 Plan の決定を踏襲する前提だった |
| 2026-07-19 | **多対多マルチロール（`user_roles`）へ方針転換。2026-06-25 の「1 ユーザー 1 role」決定を明示的に覆す** | 笹木さんの明示指示（「multi権限で メニューから切り替え可能な設計にして」）。表示モード切替（1 role + 階層）の代替案を提示のうえ、マルチロール保持が選択された |
| 2026-07-19 | `member` は暗黙保有とし、`user_roles` には上位ロールのみ格納 | 「ロール 0 個のユーザー」という不正状態を構造的に排除でき、既存 member 行の移行も不要になる。全員がメンバー機能を持つ業務前提とも一致 |
| 2026-07-19 | **認可境界 = 保有ロールの union。アクティブロールは表示状態に留め、認可に使わない** | 本人がいつでも切替可能なため認可としては無意味。GUC で RLS へ流す配管はセキュリティ向上ゼロのまま複雑さだけ増える。切替の価値は「視点の整理」と誤操作防止 |
| 2026-07-19 | `users.role` 列は残さず廃止（二重持ちしない） | FailFast 方針。単一の真実を user_roles に置く。互換列は evergreen 違反 |
| 2026-07-19 | `app.is_admin()` はシグネチャ不変で参照先のみ変更 | 呼び出し側ポリシー（99_rls.sql 全域）を無変更にでき、変更面積を最小化 |
| 2026-07-19 | interviewer の blanket 可視化はしない（per-answer 判定維持） | 面談メモ・健康状態は機微データ。担当割り当てのある回答のみ見えるべき |
| 2026-07-19 | 面談担当の割り当ては admin 限定 API。self-claim（coalesce）は残す | 割り当ては管理操作。記録開始時の自己 claim は既存動線として有用 |
| 2026-07-19 | **ロール剥奪後も既存の担当割り当て（interviewer_id）は残す** | RLS は per-answer 判定でロールを見ない。過去に実施した面談の参照は正当。剥奪したい場合の NULL 化は残課題 |
| 2026-07-19 | respondent 本人の自己指名は許容 | 実害なし。バリデーション追加は過剰 |
| 2026-07-19 | PR 2 分割（基盤 / 切替メニュー+面談フロー）。PR1 後は切替メニュー無しの中間状態を許容 | 既定 = 最上位ロール表示のため従来同等に動作し、危険な中間状態にならない |
| 2026-07-19 | 計画レビュー（改訂前版。architect + security-reviewer 並列代行）で APPROVE、NICE-TO-HAVE 12 件反映 | [Review](../reviews/2026-07-19-1643-interviewer-role-review.md) |
| 2026-07-19 | 改訂版の再レビューで BLOCKER 5 件（実質 4 論点）→ 全て Plan に反映して解消 | (1) seed/provision/CSV の追随漏れ → Phase 1 に明示 + CSV は roles 列（セミコロン区切り・上位ロールのみ）へ再設計 (2) 移行 SQL の非冪等 → 列存在ガードで囲む (3) トリガの UPDATE バイパス → BEFORE UPDATE OR DELETE に (4) 全置換 PUT × DELETE トリガの誤爆 → **差分適用**を採用（deferred constraint trigger 案は不採用: 差分適用の方が単純で、トリガも旧版と同型を保てる） |
| 2026-07-19 | `user_roles` の SELECT は自分の行 + admin 全件に絞る | admin/interviewer の名簿を全認証ユーザーに晒さない（攻撃対象の絞り込み材料を与えない）。切替メニューは自分の roles で足り、admin UI は is_admin で全件見える。非 admin から他人の roles が空に見えるのは許容 |
| 2026-07-19 | `/me` の activeRole は cookie を信頼せず毎回保有集合と突合（非包含は破棄）を不変条件とする | 表示専用とはいえ、保有外視点の表示は誤操作・誤解の元。cookie 属性も baseCookie（httpOnly）を再利用し JS からの書き換えを封じる |
| 2026-07-19 | `avatar_unique_confirmed.test.sql` の throws_ok 引数バグ（第 3 引数に説明文字列 → 期待エラーメッセージとして解釈され常に失敗）を PR1 に同梱して修正 | 既存バグ（develop でも失敗することを確認済み）。放置すると test:db が恒常的に赤くなり CI 必須条件と矛盾するため、1 行修正のみスコープ外だが同梱 |

## 残課題

- member 暗黙保有のため「メンバー機能を持たない admin 専用アカウント（bot / システム管理専用）」を構造的に表現できない。現業務前提（全員メンバー）では問題ないが、将来要件になったら再設計。
- 面談閲覧者（`answer_viewers`）の割り当て UI/API 未実装（RLS のみ存在）。
- 面談候補（`answer_interview_candidates` / `user_interview_candidates`）は未使用のまま。
- `isAdmin`（boolean）の廃止と `roles` への一本化リファクタ。
- `answers.interviewer_id` の DB 層ガード（BEFORE UPDATE トリガで変更主体を admin に限定）。当面は「respondent 向け UPDATE の SET 対象に interviewer_id を含めない」を API 実装の不変条件として維持。
- ロール剥奪時に担当割り当てを剥奪する運用/実装（現仕様は残留許容）。
- 指名先ユーザーの provisioning 前提（gotrue_id NULL の扱い）。
- 役職階層に基づく RLS 可視範囲（別 Plan）。

## ステータス

- [x] Plan レビュー（改訂前版: APPROVE、[Review](../reviews/2026-07-19-1643-interviewer-role-review.md)）
- [x] マルチロール + 切替メニューへ全面改訂（笹木さん指示）
- [x] 改訂版の再レビュー（[1701-review](../reviews/2026-07-19-1701-interviewer-role-review.md)。BLOCKER 4 論点を反映して解消）
- [ ] 笹木さんの再承認（改訂版に対して）
- [x] Phase 1（user_roles 新設 + users.role 廃止 + seed/provision/CSV 追随）
- [x] Phase 2（RLS 追随: is_admin 参照先変更 / has_role 新設 / user_roles RLS / トリガ移設）
- [x] Phase 3（domain roles 配列化 + users API 差分適用 + UserForm チェックボックス）
- [x] Phase 4（指名 API `PUT /answers/[id]/interviewer` + admin 担当者 Select）
- [x] Phase 5（/me に roles+activeRole / `PUT /api/v1/auth/active-role`。cookie は baseCookie 再利用・保有集合と毎回突合）
- [x] Phase 6（HeaderUserMenu に視点切替 / navItems を roles ベースへ / (admin) ガードを activeRole 化 + 切替ボタン）
- [x] Phase 7（`/interviews` 一覧 + 詳細。answers GET に `?mine=1` フィルタ追加 — admin は RLS で全件見えるため担当分の明示絞り込みが必要だった）
- [x] Phase 8（ドキュメント負債: CLAUDE.md / 20_org.sql / stale コメント一掃）
- [x] pgTAP（9 ファイル全通過。rls_interviewer 新規 / rls_role_admin 全面改修）/ Vitest（PR1: 94 件 → PR2: 100 件通過）/ typecheck / build / migration 冪等 2 回適用確認
- [x] PR1 作成（基盤）: [#98](https://github.com/sasakiyusuke2017015/waoon/pull/98)
- [ ] PR2 作成（切替メニュー + 面談担当向け画面）: `feature/role-switcher`（実装・検証済み、PR 作成待ち）
