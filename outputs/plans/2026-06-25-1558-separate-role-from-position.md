# Plan: 権限(認可)と役職(HR)の分離 — users.role 導入

| 項目 | 値 |
|---|---|
| 概要 | admin 判定を positions.code 990-999 → `users.role='admin'` へ移行。positions は純粋 HR マスタ化（999 廃止・#56 の昇格ガード撤去）。最後の admin を 0 人にする操作を DB トリガーで拒否。多層防御（RLS + valibot picklist + DB CHECK + トリガー）を pgTAP で担保 |
| ステータス | 🟢 マージ済み（検証中） |
| PR | [#57](https://github.com/sasakiyusuke2017015/waoon/pull/57) merged |
| Review | [コードレビュー](../reviews/2026-06-25-1627-separate-role-from-position-code-review.md)（**APPROVE**） |

## 目的

**権限（認可）と役職（HR の肩書き）を別軸に分離する。** 現状 `app.is_admin()` が
`positions.code BETWEEN 990 AND 999` を見ており、役職マスタが権限を兼ねている。これを
**`users.role` enum** に移し、positions を純粋な HR マスタにする。これにより #56 で導入した
「役職マスタの admin 帯(990-999)昇格ガード」が**不要になり撤去でき**、admin 自己昇格の懸念(B-1)が
構造的に解消する。

## スコープ

### やること

1. **`users.role` 列の追加**（`text NOT NULL DEFAULT 'member'` + `CHECK (role IN ('admin','member'))`）。
2. **`app.is_admin()` の差し替え**: `positions.code 990-999` → `users.role = 'admin'`。
3. **positions の admin 帯廃止**:
   - `positions.csv` から `999 管理者` を削除（300/500/700/900 のみに）。
   - #56 の valibot ガード（`position.ts` の 990-999 `v.check`）を撤去 → 純粋な int code に。
   - #56 の RLS `positions_write` 上書き（990-999 除外）を撤去 → ループ既定の admin-only write に戻す。
   - `rls_positions.test.sql` を新方針に合わせて書き換え（後述）。
4. **role 変更ガードの新設**:
   - role の書込は admin のみ（RLS）。
   - **最後の admin を 0 人にする変更/削除を DB トリガーで拒否**（lockout 防止）。
5. **provision / seed / users.csv に role を反映**:
   - `users.csv` に `role` 列追加。dev admin を `role='admin'`、他を `member`。
   - admin の `position_code` は 999 廃止に伴い変更（→ **空（NULL）**。システム管理者は HR 役職と独立）。
   - `provision.mjs`: 単一 admin モードは `role='admin'` で作成（position 999 をやめる）。bulk は CSV の `role` 列を使用。
6. **管理画面 UI**: ユーザー編集（`UserForm`）に **「管理者」トグル（role）** を追加（admin のみ操作可）。
7. **既存 admin の移行**: 現 position 999 の admin を `role='admin'` + position NULL へ（dev はクリーン再投入で吸収）。

### やらないこと（非ゴール）

- 役職階層に基づく RLS 可視範囲（課長→部下が見える）の実装はしない（従来どおり別 Plan）。
- 'admin'/'member' 以外のロール（viewer 等）の追加はしない（enum は将来拡張可能な形にだけしておく）。
- 多対多ロール（user_roles 中間表）は採らない（1 ユーザー 1 role。[判断ログ]）。
- 役職マスタ管理画面（#56 で作成済み）の構造変更はしない（990-999 ガード文言の除去のみ）。

## 現状コンテキスト

| 項目 | 現状（#56 後） | 出典 |
|---|---|---|
| admin 判定 | `users JOIN positions` で `positions.code BETWEEN 990 AND 999` | [90_rls_helpers.sql](../../packages/db/schema/90_rls_helpers.sql) |
| users テーブル | role 列なし。`position_id` 等の org FK のみ | [30_users.sql](../../packages/db/schema/30_users.sql) |
| positions admin 帯ガード | valibot `v.check`(990-999) + RLS `positions_write`(990-999 除外) | [position.ts](../../packages/domain/src/position.ts) / [99_rls.sql](../../packages/db/schema/99_rls.sql) |
| positions seed | 300/500/700/900/**999** | [positions.csv](../../packages/db/seed/csv/positions.csv) |
| dev admin | `users.csv` で position_code=999 / role 概念なし | [users.csv](../../packages/db/seed/csv/users.csv) |
| provision | 単一 admin を position 999 で作成 / bulk は role 概念なし | [provision.mjs](../../scripts/provision.mjs) |
| 他テーブル RLS | すべて `app.is_admin()` 経由（is_admin の中身だけ変えれば波及） | [99_rls.sql](../../packages/db/schema/99_rls.sql) |

## 実装計画

> 1 ブランチ = 1 PR（develop 向け Squash/Merge）。develop `6ede703` 起点。

### Phase 1: DB スキーマ + 認可の差し替え

1. **30_users.sql**: `role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member'))` を追加。
   既存環境向けに `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role ...` も併記（dev は再投入で吸収。pre-prod 前提）。
2. **90_rls_helpers.sql**: `is_admin()` を `users.role = 'admin'` 参照へ差し替え（positions JOIN を除去）。
3. **99_rls.sql**:
   - #56 の `positions_write`(990-999 除外) 上書きブロックを**削除** → ループ既定の admin-only に戻す。
   - **role 変更ガード**: `users_write` は admin-only のまま（is_admin が role 基準に変わる）。
   - **最後の admin 保護トリガー**を追加（`BEFORE UPDATE OR DELETE ON public.users`、`role='admin'` が 0 になる操作を `RAISE EXCEPTION`）。

### Phase 2: seed / provision / domain

4. **positions.csv**: `999 管理者` 行を削除。
5. **users.csv**: `role` 列追加（admin→`admin`、alice/bob/carol/dave→`member`）。admin の `position_code` を空に。
6. **seed-from-csv.mjs**: users 投入に `role` を含める（列追加対応）。
7. **provision.mjs**: 単一 admin は `role='admin'`・position 任意（既定 NULL）で作成。bulk は CSV の `role` を使用（無指定は member）。
8. **domain**: `position.ts` の 990-999 `v.check` 撤去。`user.ts` に `role` フィールド（`v.picklist(['admin','member'])`）を追加し、`UpdateUserSchema` で admin が変更可能に。

### Phase 3: 管理画面 + テスト

9. **UserForm**: 「管理者」トグル（role の admin/member 切替）を追加。API（users PUT）が role を受ける。
10. **API**: `users` ルートの role 更新を admin ゲート + トリガーで保護。
11. **pgTAP**:
    - `rls_positions.test.sql`: 990-999 ガード前提のケースを撤去し、「admin は役職 CRUD 可 / 非 admin 不可」に書き換え。
    - 新規: `is_admin()` が role 基準で効く / 最後の admin 削除・降格がトリガーで拒否される、を検証。
12. **検証**: クリーン再投入 + 全 pgTAP + typecheck + build + API 実機。

### 影響ファイル（想定）

- 変更: `packages/db/schema/30_users.sql` `90_rls_helpers.sql` `99_rls.sql`,
  `packages/db/seed/csv/positions.csv` `users.csv`, `scripts/seed-from-csv.mjs` `provision.mjs`,
  `packages/domain/src/position.ts` `user.ts`,
  `apps/web/components/admin/UserForm.tsx`, `apps/web/app/api/v1/users/[id]/route.ts`,
  `packages/db/tests/rls_positions.test.sql`
- 追加: `packages/db/tests/rls_role_admin.test.sql`（仮）

## 検証

- `pnpm test:db`（pgTAP）緑。**新規**: role 基準 is_admin / 最後の admin 保護トリガー / positions は admin 帯ガードなしで CRUD 可。
- クリーン再投入（`compose:dev:down -v` → dev:up）で admin が `role='admin'` でログイン・`/me` `isAdmin:true`。
- 既存 RLS テスト（answers/attachments/users 書込）が is_admin 差し替え後も緑（回帰なし）。
- provision: 単一 admin / bulk（role 列）/ 最後の admin 降格が拒否される。
- API 実機: admin がユーザーの role を切替可 / 非 admin は 403 / 最後の admin 降格は 4xx。
- `pnpm -r typecheck` / `pnpm --filter @waoon/web build` 通過。

## リスク

| # | リスク | 対策 |
|---|---|---|
| R1 | `is_admin()` 差し替えで全 RLS（answers/attachments/users/master）に波及 | is_admin の本体だけ変える設計。既存 pgTAP 全件で回帰確認 |
| R2 | 既存環境への `role` 列追加（CREATE TABLE IF NOT EXISTS は列を足さない）| `ALTER TABLE ADD COLUMN IF NOT EXISTS` 併記 + dev は再投入。pre-prod 前提で後方互換は持たせない（FailFast） |
| R3 | 最後の admin を降格/削除して全員ロックアウト | DB トリガーで 0 admin 化を拒否（API だけに頼らない）。pgTAP で担保 |
| R4 | admin の position 999 削除で既存 admin の position_id が宙吊り | 移行で admin を position NULL + role='admin' に。dev は再投入で吸収 |
| R5 | #56 で入れたばかりの positions ガードを撤去する（短期の往復）| evergreen に従い現行最善へ。撤去理由を判断ログに残す |
| R6 | role を平文文字列で持つ誤値混入 | `CHECK (role IN ('admin','member'))` + valibot `v.picklist` で二重に制約 |

## 判断ログ

| 日時 | 決定 | 理由 |
|---|---|---|
| 2026-06-25 | 権限を `users.role` enum（'admin'/'member'）で持つ | 役職(HR)と権限(認可)は別軸。1 ユーザー 1 role で十分。多対多/roles マスタは過剰（将来 picklist 拡張で対応） |
| 2026-06-25 | positions の admin 帯(990-999)を廃止し #56 のガードを撤去 | 権限が role に移るため positions は純粋 HR マスタ化。昇格ガード自体が不要になる |
| 2026-06-25 | 最後の admin 保護は **DB トリガー**で実装 | RLS の WITH CHECK では他行カウント不可。API だけだとバイパス余地。トリガーが最も堅い |
| 2026-06-25 | dev admin の position は NULL に | システム管理者の HR 役職は独立（分離の趣旨）。必要なら後から付与 |

## ステータス

- [x] 計画承認（笹木さん）
- [x] Phase 1: スキーマ + is_admin 差し替え + role 保護トリガー
- [x] Phase 2: seed/provision/domain に role 反映・positions 999 廃止
- [x] Phase 3: UI 管理者トグル + pgTAP 更新
- [x] ローカル検証（pgTAP 7 / typecheck / build / API 実機: 昇格・最後のadmin保護409・帯ガード撤去）
- [x] コードレビュー（[2026-06-25-1627](../reviews/2026-06-25-1627-separate-role-from-position-code-review.md)・**APPROVE**）→ 安価な指摘を反映済み
- [x] PR 作成・マージ（[#57](https://github.com/sasakiyusuke2017015/waoon/pull/57) merged）
- [x] マージ後検証（develop で再確認）
  - [x] develop クリーン投入 + pgTAP all passed（7 files。role 基準 is_admin + 最後の admin 保護）
  - [x] DB 確認: admin=role'admin'・position なし / 他=member / positions に 999 なし
  - [x] API 実機（dev サーバ）: 管理者トグル昇格→isAdmin true / 最後の admin 降格 409 / 役職 995 作成 201
  - [ ] **ブラウザ手動確認**: ユーザー編集の「権限（管理者/一般）」トグル（笹木さん）

> 実装 + コードレビュー（APPROVE）+ マージ完了。残るは権限トグルのブラウザ手動確認のみ。
> 残課題: bulk ローダーの role picklist 早期検証、複数 admin 同時降格の STATEMENT トリガー補強（任意）。
