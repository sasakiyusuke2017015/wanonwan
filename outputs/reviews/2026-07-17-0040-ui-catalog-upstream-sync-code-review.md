# Review: ui-catalog 上流最新版の選択的マージ（packages/ui 刷新）— 実装

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-17 00:40 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-16-2354-ui-catalog-upstream-sync.md`](../plans/2026-07-16-2354-ui-catalog-upstream-sync.md) |
| ブランチ | `feature/ui-catalog-upstream-sync` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |
| verdict | **APPROVE** |

## サマリ

上流 `@ai-education/ui` 0.2.0 を vendored `packages/ui`（`@ui-catalog/core`）へ選択的マージした
未 commit 差分（tracked 134 ファイル + 新規部品 147 ファイル、+4003/-2905）をレビューした。
barrel の export 整合、dead exports 削除の妥当性、MarkdownPreview のサニタイズ維持、
lucide-react の静的 import、IconButton Tooltip 内蔵化に伴う二重表示、Badge tone 追随を
実コマンドで確認した。`BLOCKER` はなし。指摘 4 件はすべて `[NICE-TO-HAVE]`
（PR 前クリーンアップ / メタデータ drift 系）で、**レビュー直後にすべて反映済み**（末尾参照）。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | N/A（本 Review では計画は見ない） |
| 実装判定 | APPROVE |
| 記録整理 | FOLLOW-UP → 対応済み（version registry / ui.zip / doc comment の drift） |

## 事実検証の結果（コマンドで裏取り）

| 観点 | 検証 | 結果 |
|---|---|---|
| dead exports 削除の妥当性 | `./calend/*` の指す `core/hooks/calend/` の存否 | ディレクトリ非存在 = 真の dead。`./styles` も `core/styles/index.ts` 非存在。削除は正当 |
| calendar import が壊れない | apps/web の `@ui-catalog/core/calendar/state` と package.json | `./calendar/state → ./core/hooks/calendar/calendar.ts`（実在）で解決。削除した `./calend/*` とは別パスで無関係 |
| MarkdownPreview サニタイズ維持 | `MarkdownPreview.tsx` | `DOMPurify.sanitize` を通してから `dangerouslySetInnerHTML`。エラーメッセージ経路も sanitize 済み |
| lucide-react の外部送信混入 | grep | `lucide-registry.ts` の静的 named import のみ。動的 import / 全量 import なし |
| IconButton の native title 二重表示 | apps/web の IconButton 呼び出しに `title=` があるか | 該当ゼロ。二重 Tooltip リグレッションは apps/web に無し |
| Badge tone 追随 | `apps/web/app/ui-demo/page.tsx` | `variant="success"` → `tone="success"` に正しく追随 |
| Toast の enableShimmer 削除 | `Toast.tsx` | 上流 Button から prop 消滅に伴う削除で整合 |
| CI parity | `pnpm turbo run typecheck lint build test` | 8 タスク成功。vitest の新規失敗ゼロ（既存 13 失敗は HEAD でも再現） |

## Findings

### [NICE-TO-HAVE] parent-strict.cjs が `@ai-education/ui` へ逆戻り

`packages/ui/infra/eslint/parent-strict.cjs` — 上流版採用でパッケージ名リネームが巻き戻り、
うち 1 箇所は実際の ESLint ルール値（深い import 禁止の `group`）。apps/web はこの config を
extends していないため実効影響ゼロだが、名前統一の取りこぼし。→ **6 箇所を `@ui-catalog/core` に置換済み**

### [NICE-TO-HAVE] VERSION_REGISTRY / versions.json が現存 waoon 部品を落とした

上流のクリーン JSON で全面置換した結果、export されて現存する waoon 部品
（AppShell / Header / Footer / SideNav / SubHeader / Toast / InteractiveTable / TabBar 等 19 件）
が registry から欠落。catalog-integrity テストは「export 部品の registry 掲載」を検査しない
ためすり抜ける。ランタイム影響なし（version 追跡メタデータのみ）。
→ **19 件 + SubHeaderToolbar（HEAD でも未掲載だった gap）を registry へ復帰し、versions.json を registry から再生成済み（136 entries）**

### [NICE-TO-HAVE] SelectableList の JSDoc が見送り部品 LevelBadge を参照

`SelectableList.tsx` の使用例がコピペ不能。→ **`<Badge value=... size="small" />` に置換済み**

### [NICE-TO-HAVE] ui.zip（21M）が repo root に untracked で残存

`git add -A` での誤コミットリスク。→ **`.gitignore` に `/ui.zip` を追加済み**（実ファイルは目視検証完了まで保持）

## 検証（この Review 自体の）

- [x] `git status --short` / `git diff` で全変更ファイルを列挙・確認
- [x] barrel 4 本（atoms / molecules / organisms / templates）の export を目視し、DataTable subpath 分離・waoon 独自部品の export 維持を確認
- [x] 削除 exports（`./styles` `./calend/*`）の target 非存在をコマンド確認
- [x] MarkdownPreview の DOMPurify サニタイズ経路を確認
- [x] lucide-react が静的 import のみであることを grep 確認
- [x] apps/web で IconButton に `title` を渡す箇所ゼロを確認
- [x] 指摘反映後に catalog-integrity テスト + `turbo run typecheck lint` の green を再確認
- 検証ギャップ: 上流置換 115 ファイルの中身は個別レビューせず、三方向比較の集計と
  CI green を所与とした。dev スタックでの Icon lucide 化・テーマ崩れの目視確認は
  Plan 末尾チェックボックス（未了）に委ねる。

## フォローアップ

- [x] `parent-strict.cjs` の `@ai-education/ui` 6 箇所を `@ui-catalog/core` へ統一
- [x] version registry / versions.json へ waoon 部品 20 件を復帰・再生成
- [x] `SelectableList.tsx` の JSDoc を `LevelBadge` → `Badge` に置換
- [x] `.gitignore` に `/ui.zip` を追加
- [ ] dev スタックで主要画面の目視確認（Plan 末尾の未了チェック）
