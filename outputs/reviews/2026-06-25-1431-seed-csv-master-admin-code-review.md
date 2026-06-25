# Review: seed の CSV 化 + マスタ管理基盤（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-25 14:31 JST |
| レビュアー | Claude Code（code-reviewer + security-reviewer 並列） |
| 対象 Plan | [`plans/2026-06-25-1025-seed-csv-master-admin.md`](../plans/2026-06-25-1025-seed-csv-master-admin.md) |
| ブランチ | `feature/seed-csv-master-admin` |
| 関連 PR | TBD |
| レビュー種別 | 実装（コード） |
| 対象差分 | `git diff develop...HEAD`（d013dfd Phase1+2 / ceb2bb6 Phase3 / ffc0884 docs） |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER ゼロ。NICE-TO-HAVE のみ |
| Plan 判定 | N/A | 本 Review は実装を見る |
| 実装判定 | APPROVE | コード品質・整合・セキュリティとも問題なし |
| 記録整理 | OK | Plan と実装が一致 |

> code-reviewer verdict = APPROVE / security-reviewer verdict = APPROVE。
> CRITICAL/HIGH（[BLOCKER]）はゼロ。共通指摘（positions.code 生値補間）は本レビュー後に修正済み。

## 指摘事項

| 重大度 | ラベル | ファイル:行 | 指摘 | 対応 |
|---|---|---|---|---|
| LOW | NICE | `scripts/seed-from-csv.mjs`（positions build） | positions.code のみ `sqlStr` を通さず生値補間。非数値混入時に無検証 | **修正済み**: `intLiteral()` で整数保証してから補間 |
| MEDIUM | NICE | `scripts/provision.mjs`（PW ファイル出力先） | 一時 PW ファイルがリポジトリ直下に出力。`.gitignore` 済みだが `git add -f` 等で誤コミット余地 | 残課題: 出力先をリポジトリ外（tmpdir / `--out`）へ寄せる。当面は運用警告 + .gitignore で許容 |
| MEDIUM | NICE | `scripts/provision.mjs`（エラーログ） | GoTrue 失敗時に `e.stdout` をそのまま出力。理論上 PW 混入余地（現 GoTrue は返さない） | 残課題: エラーログを email + status に絞る or redact |
| LOW | NICE | `app/api/v1/*/[id]/route.ts`（全8本） | `Number(id)` が NaN→0 行→404。実害なし・既存 users と同挙動 | 残課題: NaN 早期 400 を共通ヘルパ化 |
| LOW | NICE | RLS テスト | divisions/departments/sections の非 admin write 拒否が pgTAP 未担保（positions のみ担保） | 残課題: 3 マスタの RLS テスト 1 ケースずつ追加 |
| LOW | NICE | `lib/db/errors.ts:16` | `mapDbError` の fallback が全て 400。予期せぬ DB エラーも 400 で監視に乗らない | 残課題: 既知コード以外は 500 + `console.error` |
| LOW | NICE | `MasterForm.tsx` / `MasterListView.tsx` | useEffect 依存にオブジェクト参照（実害なし・定数）/ 不要 spread コピー | 残課題: 軽微整理 |

## 実装レビュー（要点）

- **SQL インジェクション**: 全テキストカラムが `sqlStr`（`'`→`''`）で一貫エスケープ。テーブル名は固定リテラル。positions.code も `intLiteral` で整数保証に修正済み → 補間経路の穴は解消。
- **冪等性 / 部分失敗**: 「非空スキップ」+「email/code 重複 skip」+「DB insert 失敗時のみ GoTrue cleanup」+「failed>0 で exit(1)」。堅牢で、ローカル注入テストでも orphan ゼロを確認済み。
- **API 整合**: `withActiveUser` / `withUser` / `parseBody` / `mapDbError` が既存 users route と完全一致。`tx(set)` は固定キーのみで列名注入なし。`mapDeleteError`（FK 23503 を DELETE で 409）の使い分けも正しい。
- **汎用化**: `MasterConfig` 駆動だが text/number 2 種 + parent 1 段に抑制。過剰汎用化なし。型安全・イミュータブル更新も適切。

## セキュリティ（B-1 二重防御の確認）

- RLS `code NOT BETWEEN 990 AND 999`（=`code<990 OR code>999`）と valibot `c < 990 || c > 999` は**範囲・境界（990/999 とも拒否）が完全一致**。`positions.code` は `int UNIQUE NOT NULL` で NULL 三値論理の穴なし。
- 既存 999 行は USING で不可視 → アプリから UPDATE/DELETE 不可（0 行）。990-999 新規 INSERT は WITH CHECK で 42501。非 admin は is_admin()=false で全拒否。pgTAP `rls_positions.test.sql` がこれらをカバー。
- `users.position_id` 経由の昇格は users API（本 PR 変更外）の `users_write` が `is_admin()` のみ許可 → 非 admin は不可。admin による付与は権限の正常行使でスコープ外。
- `positions_write` の差し替えは write 系のみ。`positions_select` は据え置きで、一般ユーザーは役職一覧を読める（SELECT は壊れていない）。

## 検証

- [x] `pnpm -r typecheck` green（全パッケージ）
- [x] `pnpm --filter @waoon/web build` 成功（全 admin ルート生成）
- [x] `pnpm test:db` all passed（6 files・admin 帯昇格不可含む）
- [x] API 実機（dev サーバ）: admin CRUD / FK 削除 409 / admin帯 995 → 400 / 非admin → 403

## フォローアップ（別タスク候補・本 PR では対応しない）

- [ ] provision の PW ファイル出力先をリポジトリ外へ + エラーログ redact（MEDIUM×2）
- [ ] divisions/departments/sections の RLS pgTAP を追加
- [ ] `Number(id)` NaN の早期 400 共通ヘルパ化
- [ ] `mapDbError` の未知コードを 500 + `console.error` に
- [ ] B-1 拡張: users.position_id への admin帯付与ガード（既存 users ルート・別 Plan）
