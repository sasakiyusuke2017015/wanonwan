# Review: ui-catalog 上流最新版の選択的マージ（packages/ui 刷新）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-17 00:05 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-16-2354-ui-catalog-upstream-sync.md`](../plans/2026-07-16-2354-ui-catalog-upstream-sync.md) |
| ブランチ | `feature/ui-catalog-upstream-sync` |
| 関連 PR | TBD |
| レビュー種別 | 計画 |
| verdict | **APPROVE** |

## サマリ

上流 `@ai-education/ui` 0.2.0（ui.zip）を vendored `packages/ui`（`@ui-catalog/core`）へ
選択的マージする Plan を計画レビューした。Plan の必須要素は全て揃い、最大リスク
（Icon lucide 化 / tokens テーマ崩れ / barrel マージ）を正しく特定している。Plan 中の
主要な事実主張はコマンドで裏取りでき、いずれもおおむね正確だった。`BLOCKER` はなし。

## 判定スコープ

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | 計画として実装に進めてよい |
| Plan 判定 | APPROVE | スコープ・リスク整理・手順の妥当性は十分 |
| 実装判定 | N/A | 本 Review では実装は見ない |
| 記録整理 | FOLLOW-UP | Plan ヘッダが `_template.md` 形式（概要 / ステータス enum / 前提 Plan）でなく、dashboard 生成が fail する |

## 事実検証の結果（コマンドで裏取り）

| Plan の主張 | 検証方法 | 結果 |
|---|---|---|
| apps/web の import 119 箇所 | grep 実測 | 119 occurrences / 39 files — 一致 |
| wanonwan 追加 5 アイコン plus/pencil/copy/ban/grip | 現行 `icons.ts` を grep | 5 種すべて wanonwan 側に存在 — 確認 |
| その 5 種が上流にも存在する「見込み」 | 上流 `icons.ts` / lucide-registry を grep | plus/pencil/copy/grip は上流に存在。**`ban` は上流 registry に standalone で見当たらず**（Plan の「無ければ追補」が的中） |
| lucide-react / react-easy-crop の追加が必要 | 両 package.json 比較 | 上流 deps にあり wanonwan deps に無し — 追加は正当 |
| DataTable / Toast は wanonwan 版が中核 | apps/web を grep | DataTable 6 files / ToastProvider・useToast 3 files で実使用 — wanonwan 版優先は妥当 |
| packages/ui の vitest は CI 除外中 | `.github/workflows/ci.yml` + packages/ui `scripts` | CI は `turbo run typecheck lint build test`。packages/ui に `test` script が無いため turbo が skip → 実質 CI 除外は事実 |
| tokens.css がテーマに影響 | `apps/web/app/globals.css` | `@import "@ui-catalog/core/styles/tokens"` + `@source packages/ui/core` で apps/web に流入 — テーマ崩れリスクは実在 |
| apps/worker への影響 | grep | worker は ui を import せず — Plan が worker を対象外にしているのは正しい |

## 妥当性レビュー

- **必須要素**: 目的 / スコープ（やること・やらないこと）/ 現状コンテキスト（三方向比較の数表付き）/
  実装計画（5 Phase）/ 検証 / リスク表 / 判断ログ / ステータス、すべて揃っている。
- **スコープ境界**: 「zip 全面上書きしない」「DataTable/Toast は取り込まない」
  「ai-education ドメイン部品は見送り」が明示され、採用/見送りリストで部品単位まで確定済み。
- **影響範囲の網羅性**: CI（`turbo run ... test`）、tailwind（`@source` + `@import tokens`）、
  tsconfig（`transpilePackages: ["@ui-catalog/core"]` で apps/web が ui 全ソースを型チェック）、
  lockfile（Phase 4 で `pnpm install`）まで Plan の記述と整合。worker は依存ゼロで対象外が正しく、
  DB / API / 認可 / RLS には触れない UI パッケージ限定変更で系全体リスクは低い。
- **内部整合**: 衝突「33 件（barrel 含む）」= スコープ表「23 + DataTable 系 10」で一致。数値の破綻なし。
- **最大リスクの捕捉**: apps/web が transpilePackages で ui 全ツリーを型チェックするため、
  未使用の採用部品でも型エラーは build を落とす =「見送り部品への内部参照」リスクは
  確実に検出できる構造で、Plan の緩和策（typecheck gating）は現実的。

## 過去事例からの教訓

- [`datatable-port`](../plans/2026-07-05-0920-datatable-port.md) /
  [`subheader-toolbar`](../plans/2026-07-07-1430-subheader-toolbar.md) など UI 系 Plan は
  「apps/web import を壊さない」「barrel export を正しく通す」を一貫課題にしてきた。
  本 Plan は Phase ごとの typecheck gating と barrel union を明記しており、
  同じ轍（export 漏れで import 崩壊）を回避する設計になっている。
- 撤回 Plan（pgbouncer-tls-proxy 等）は「所与インフラを別方式に置換して破綻」した類型。
  本 Plan は vendoring 方式・名義・exports 構造を維持するため、失敗パターンとは被らない。

## 指摘事項

| 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| NICE-TO-HAVE | `## 検証` | 検証コマンドが CI 実体（`pnpm turbo run typecheck lint build test`）と非対称。local green が CI green を保証しない | 検証節に CI と同一コマンドを 1 行追加 |
| NICE-TO-HAVE | `## 検証`（vitest 行） | packages/ui には `test` npm script が無く、`*.test.{ts,tsx}`（Phase 3 でコピーする上流テスト含む）は CI で走らない。「packages/ui の vitest」を回す具体コマンドが未定義 | `pnpm --filter @ui-catalog/core exec vitest run` を明記し、「新規コピーしたテストは CI ゲート外」である事実と `test` script 追加の要否を判断ログに |
| NICE-TO-HAVE | `## リスク`（Icon 行） | `ban` が上流 registry に standalone で見当たらない。「無ければ追補」で拾える設計だが、既知欠落として名指ししておくと取りこぼしを防げる | Icon マージ手順に「`ban` は上流に無い前提で wanonwan 定義を再追補」と具体化 |
| NICE-TO-HAVE | `## スコープ`（package.json exports） | 採用新規部品が root barrel 経由で到達可能であることの確認手順が無い。subpath import が必要な部品があれば `exports` 追記が要る | Phase 3 後に「採用部品が `@ui-catalog/core` から解決できる」ことを typecheck 用 import で確認する一文を追加 |
| NICE-TO-HAVE（記録整理） | ヘッダ表 | `_template.md` が要求する `概要`（dashboard 1 行）/ `ステータス` enum / `前提 Plan` 行が欠落。`gen-outputs-readme.mjs` は Plan ヘッダ不備で fail する | ヘッダを template 形式に修正し dashboard 再生成 |

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] apps/web の import 数・DataTable / Toast 使用状況を grep で実測
- [x] CI（ci.yml）/ CD（cd.yml）/ worker への影響をコマンドで確認
- [x] tailwind（globals.css `@source` / `@import tokens`）・tsconfig（transpilePackages）・lockfile 経路を確認
- [x] 上流 zip と現行 packages/ui の package.json deps 差分（lucide-react / react-easy-crop）を確認
- [x] wanonwan / 上流双方の icons.ts で 5 アイコンの存否を照合（`ban` の欠落を検出）
- [x] 過去 UI 系 Plan / 撤回 Plan との重複・矛盾を確認
- 検証ギャップ: 上流 115 ファイルの中身レビューは未実施（三方向比較の集計値を所与とした）。
  個々のファイル内容の正当性は実装後の `/pr-review` で担保する前提。

## フォローアップ

- [ ] 検証節に CI 同一コマンド（`pnpm turbo run typecheck lint build test`）を追加
- [ ] packages/ui vitest の実行コマンド明記 + CI ゲート外である旨を判断ログへ
- [ ] Icon マージ手順で `ban` を既知欠落として明示
- [ ] Phase 3 に root barrel 解決確認を追加
- [ ] Plan ヘッダを `_template.md` 形式に修正し dashboard 再生成
