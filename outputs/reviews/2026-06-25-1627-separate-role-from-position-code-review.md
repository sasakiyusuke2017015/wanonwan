# Review: 権限(role)と役職(position)の分離（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-25 16:27 JST |
| レビュアー | Claude Code（code-reviewer + security-reviewer 並列） |
| 対象 Plan | [`plans/2026-06-25-1558-separate-role-from-position.md`](../plans/2026-06-25-1558-separate-role-from-position.md) |
| ブランチ | `feature/separate-role-from-position` |
| 関連 PR | TBD |
| レビュー種別 | 実装（コード） |
| 対象差分 | `git diff develop...HEAD`（c7dcd59 feat / 1420f2a docs） |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER ゼロ。NICE-TO-HAVE のみ |
| 実装判定 | APPROVE | 認可移行・トリガー・seed/provision・UI とも妥当 |
| 記録整理 | OK | Plan と実装が一致 |

> code-reviewer = APPROVE / security-reviewer = APPROVE。CRITICAL/HIGH（[BLOCKER]）ゼロ。
> 安価な指摘（PUT returning に role / 型安全 / トリガー正常系テスト / POST role コメント）は本レビュー後に修正済み。

## 指摘事項

| 重大度 | ラベル | ファイル:行 | 指摘 | 対応 |
|---|---|---|---|---|
| HIGH | NICE | `users/[id]/route.ts`（PUT returning）| PUT の returning に role が無く POST と非対称。role 更新がレスポンスに反映されない | **修正済み**: `returning ... role` を追加 |
| MEDIUM | NICE | `users/route.ts`（POST role）| 「role 付与は admin のみ」の不変条件がコード上明示されず、将来ゲートが緩むと自己昇格余地 | **修正済み**: 意図コメントを追加（is_admin ゲート + RLS が保証） |
| LOW | NICE | `rls_role_admin.test.sql` | トリガー正常系（admin→admin 更新・2 admin で 1 降格・昇格）が未検証で過剰拒否回帰を拾えない | **修正済み**: 正常系 3 ケース + 前提アサートを追加（plan 7） |
| LOW | NICE | `UserForm.tsx`（UserDetail.role）| role が生 string で domain の `UserRole` と未連動 | **修正済み**: `type UserRole` を import して型付け |
| LOW | NICE | `seed-from-csv.mjs` / `provision.mjs`（role）| bulk CSV の role typo は DB CHECK 依存で投入時まで発覚しない | 残課題: ローダーで role を picklist 早期検証（DB CHECK で防御は効く） |

## 実装レビュー（要点）

- **認可移行**: `app.is_admin()` を `users.role='admin'` の EXISTS に一本化（[90_rls_helpers.sql](../../packages/db/schema/90_rls_helpers.sql)）。`role` は `NOT NULL DEFAULT 'member' + CHECK (role IN ('admin','member'))` で NULL/未設定/型ブレ/想定外値を構造的に排除 → **fail-closed**。全テーブル RLS が is_admin 経由のため本体差し替えで波及を吸収。
- **DB 移行**: CREATE TABLE 列定義 + `ALTER ADD COLUMN IF NOT EXISTS` + `DO $$ pg_constraint` での CHECK 冪等追加。再適用で壊れない（ADD COLUMN が CHECK を付けられない制約を CHECK 分離で回避）。
- **最後の admin 保護**: `prevent_last_admin_removal`（BEFORE UPDATE/DELETE / SECURITY DEFINER / search_path 固定）。条件 `OLD.role='admin' AND (DELETE OR NEW.role<>'admin')` で「admin が admin でなくなる遷移」だけ検査、`count(*) ... id <> OLD.id = 0` で他 admin 不在時に拒否。`id` は GENERATED ALWAYS で `OLD.id` 信頼可。
- **昇格防止**: role 更新は `users_write`（admin のみ）配下 + valibot `picklist` + DB CHECK + API 層 is_admin ゲートの多層。positions ガード撤去後も positions は is_admin に無関係＝新規昇格面なし。
- **API/UI**: `tx(set)` はカラム名・値ともエスケープ、set キーはホワイトリスト。P0001→409 の明確メッセージ。UserForm の権限セレクトは UserRole 型に連動。

## セキュリティ（移行の核）

- is_admin の源を role に一本化したことで判定がシンプル化。NULL/未認証/未紐付けは false（fail-closed）。
- 非 admin は自他いずれの role も書けない（RLS users_write + withUser の RLS コンテキスト固定）。値域は picklist + CHECK の二重。
- 最後の admin 保護トリガーは論理的に正しく、id 自己除外カウントの回避不可。pgTAP で負例（P0001）+ 正例を担保。

## 検証

- [x] `pnpm -r typecheck` green
- [x] `pnpm --filter @waoon/web build` 成功
- [x] `pnpm test:db` all passed（7 files。rls_positions 書き換え + rls_role_admin 強化）
- [x] API 実機: role 基準 is_admin（admin true/alice false）/ 管理者トグル昇格→isAdmin true / 最後の admin 降格 = 409 / 役職 995 作成 = 201（帯ガード撤去）
- [x] クリーン投入: admin=role'admin'・position なし / 他=member / positions に 999 なし

## フォローアップ（別タスク候補）

- [ ] bulk ローダーで role を投入前に picklist 検証（行番号付き early die）
- [ ] 複数 admin 同時降格（1 文で複数行）はトリガーの理論的限界。API は単一 id のみで経路なしだが、必要なら STATEMENT トリガーで補強
