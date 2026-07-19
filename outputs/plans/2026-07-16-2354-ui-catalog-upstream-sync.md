# Plan: ui-catalog 上流最新版の選択的マージ（packages/ui 刷新）

| 項目 | 値 |
|---|---|
| 概要 | ui-catalog 上流最新版 (ui.zip) を packages/ui へ選択的マージ。上流のみ変更 115 件採用 / waoon 独自部品維持 / 衝突 33 件個別マージ / 汎用新規部品のみ採用 |
| ステータス | 🟢 マージ済み（検証中） |
| 前提 Plan | なし |
| PR | [#97](https://github.com/sasakiyusuke2017015/waoon/pull/97) |
| Review | [計画レビュー](../reviews/2026-07-17-0005-ui-catalog-upstream-sync-review.md) / [コードレビュー](../reviews/2026-07-17-0040-ui-catalog-upstream-sync-code-review.md) |

ブランチ: `feature/ui-catalog-upstream-sync`

## 目的

ai-education 側で進化した ui-catalog 上流最新版（`ui.zip` = `@ai-education/ui` 0.2.0、
2026-07-15 時点）を、waoon の vendored コピー `packages/ui`（`@ui-catalog/core`）へ
**選択的マージ**で取り込む。waoon 側で独自に育てた部品・修正を失わずに、
上流のコンポーネント改善（Icon 1.5→1.7 の lucide 化、IconButton 1.0→1.2、
Badge / Tooltip 更新、トークン拡充）と汎用新規部品を獲得する。

## スコープ

### やること

- 上流のみが変更した共通ファイル **115 件** を上流版で置換
- 両側で変更が衝突した **33 件**（barrel 含む）を個別マージ
- 上流の新規部品のうち **汎用部品のみ** 採用（下記「採用リスト」）
- `package.json`: `@ui-catalog/core` 名義・waoon 独自 exports を維持したまま、
  `lucide-react`（Icon 1.7 必須）と `react-easy-crop`（ThumbnailCropper 採用時）を追加
- `ui-catalog.versions.json` を上流のクリーンな JSON で更新
  （現行ファイルは npm 警告テキストが混入している）
- マージ後に typecheck / build / test で無破壊を検証

### やらないこと

- **zip での全面上書き**（waoon 独自部品 123 ファイルが消えるため不可）
- **DataTable / Toast の上流版採用**（waoon 版が admin 画面・ToastProvider の中核。
  waoon 版を優先し、上流版の差分は取り込まない）
- ai-education ドメイン専用部品の取り込み（下記「見送りリスト」）
- zip 内の `node_modules/` `.storybook/` `.turbo/` `visual*/` `playwright*` のコピー
- apps/web 側の新機能追加（import 119 箇所が壊れないことの検証のみ）

## 現状コンテキスト（2026-07-16 時点）

- `packages/ui` は Phase 0（`e48d620`）で vendoring 後、waoon 側だけで 20 コミット以上
  独自進化（DataTable システム、SubHeaderToolbar、AppShell、Toast、テーマ 3 軸など）。
- 上流も同期間に独自進化しており、完全に分岐している。
- 初回取り込み時点を基準にした三方向比較の結果:

| 分類 | ファイル数 | 対応 |
|---|---|---|
| 改行コード（CRLF/LF）差のみ | 430 | 現行の改行コードに揃えて実質無変更扱い |
| 上流のみ変更 | 115 | 上流版を採用 |
| waoon のみ変更 | 16 | 現状維持 |
| 両方変更（衝突） | 23 + DataTable 系 10 | 個別マージ |
| waoon 独自部品（上流に無い） | 123 | 必ず維持 |
| 上流の新規部品 | 248 | 汎用のみ採用 |

- 衝突の性質:
  - **Icon / icons.ts**: 上流が lucide-react ベースへ全面書き換え（+350 行）。
    waoon 追加の 5 アイコン（plus / pencil / copy / ban / grip）は上流レジストリに
    存在する見込み → マージ時に全数検証
  - **Modal / Dialog**: waoon の focus-trap / ARIA 修正が上流にも入り、ほぼ収束済み（差分 30〜40 行）
  - **DataTable**: 双方が別進化（実質差分 170 行）→ waoon 版優先
  - **Toast**: 双方が独立に追加 → waoon 版優先（ToastProvider / useToast と結合済み）
  - **tokens.css / globals.css**: 上流がトークン大幅追加（+123 行）、waoon 変更は 9 行 → 機械的マージ可
  - **barrel（core/index.ts, atoms/molecules/organisms/templates/index.ts 等）**: export の union + 見送り部品の除外

### 上流新規部品の採否

**採用（汎用）**: Avatar, Dropzone, Pill, ScrollArea, ShimmerOverlay, StatusPill,
ActionBar, AsyncActionButton, Collapse, FieldShell, FormFields, FormGrid,
RadioCard, RatingInput, SectionHeading, SegmentedControl, StatCard,
StickyFormFooter, ThumbnailCropper, SelectableList, TitledBlock, DangerZone,
AdminPageHeader, CsvActionBar, PageHeaderIconNav, SidebarNavGroup, SidebarNavItem,
SidebarNav, ComingSoon, Confetti, FormPageShell, ShellLayout,
utils/formatMinutes, Icon/lucide-registry

**見送り（ai-education ドメイン専用）**: LevelBadge, PassBadge, CategoryAccuracyBar,
CategoryAccuracyList, ExplanationToggle, QuestionCard, QuestionJumpNav, ScoreBar,
ScoreMeter, AttemptReviewList, CourseCard, ExamCategoryComposer, QuizList,
ResultScoreMeter, ReviewList, RelatedByTypeTable, RelatedList, MasterRefFields,
PasswordRevealBanner, PasswordRevealModal, ProfilePhotoCard

> RatingInput はアンケート回答 UI に転用余地があるため採用側に含める。
> 採否はレビューで調整可（barrel の export 行の増減のみで足抜きできる）。

## 実装計画

1. **ブランチ作成**: `develop` 起点で `feature/ui-catalog-upstream-sync`
2. **Phase 1 — 無衝突置換**: 上流のみ変更の 115 ファイルを上流版で置換
   （改行コードは現行リポジトリに合わせる）。waoon のみ変更 16 + 独自部品 123 は触らない
3. **Phase 2 — 衝突マージ**:
   - Icon / icons.ts: 上流版採用 + waoon 追加アイコン 5 種の存在検証。
     **`ban` は上流 registry に無いことを計画レビューで確認済み → waoon 定義を再追補する**。
     残り 4 種（plus / pencil / copy / grip）は上流に存在
   - Modal / Dialog / MarkdownPreview / EventModal / AgendaView / Input / Select /
     IconButton: 上流版ベースに waoon 差分を再適用
   - DataTable 系 10 ファイル + Toast: waoon 版維持（上流差分は不採用）
   - tokens.css / globals.css: 上流トークン追加 + waoon の 9 行を保持
   - barrel index 群: export を union し、見送り部品の export を除外
4. **Phase 3 — 新規部品追加**: 採用リストの部品 + テストをコピー、barrel へ export 追加。
   追加後、採用部品が `@ui-catalog/core`（root barrel / 既存 subpath）から解決できることを
   typecheck で確認。subpath import が必要な部品が出たら `exports` へ追記
5. **Phase 4 — メタ更新**: `package.json`（deps 追加のみ、名義 / exports 構造は維持）、
   `ui-catalog.versions.json` 更新、`pnpm install` で lockfile 更新
6. **Phase 5 — 検証**（下記）→ `/pr-review` → PR 作成（要確認）

各 Phase 完了ごとに typecheck を回し、壊れた時点で切り分けられるようにする。

## 検証

- `pnpm turbo run typecheck lint build test`（CI と同一コマンドで parity 担保）
- `pnpm -r typecheck`（apps/web の import 119 箇所の無破壊確認）
- `pnpm --filter @waoon/web build`
- `pnpm --filter @ui-catalog/core lint`
- `pnpm --filter @ui-catalog/core exec vitest run`
  （packages/ui に `test` script が無く CI ゲート外のため、手元で明示実行して回帰確認）
- dev スタックで主要画面（admin 一覧 / ダッシュボード / スケジュール / 回答）の目視確認
  — 特に Icon の lucide 化で全アイコンが描画されること

## リスク

| リスク | 影響 | 緩和策 |
|---|---|---|
| Icon lucide 化で waoon 使用アイコンが欠落・見た目変化 | 全画面 | マージ時に使用アイコン名を全数照合 + 目視確認 |
| 上流の破壊的 API 変更（Badge / Tooltip / IconButton 等） | apps/web 119 import | typecheck + build で検出。壊れたら該当部品のみ waoon 版へ戻す |
| 見送り部品への内部参照が採用部品に残る | ビルド失敗 | typecheck で検出し、参照元ごと採否を再判断 |
| tokens.css 追加による既存テーマ（rose/sharp/fabric）の見た目崩れ | 全画面 | 目視確認。崩れたら waoon トークンを優先 |
| lockfile 更新による他 package への波及 | CI | `pnpm install` 後に全体 typecheck |

## 判断ログ

| 日時 | 判断 | 理由 |
|---|---|---|
| 2026-07-16 | 全面上書きではなく選択的マージ | waoon 独自部品 123 ファイルと独自修正 16 ファイルが消えるため |
| 2026-07-16 | DataTable / Toast は waoon 版優先 | admin 画面・ToastProvider の中核で、上流版とは別進化。置換リスクが利益を上回る |
| 2026-07-16 | 新規部品は汎用のみ採用 | ai-education ドメイン専用（クイズ / 試験系）は waoon で使途がなく dead code になる（evergreen 方針） |
| 2026-07-16 | package.json 名義 / exports は waoon 版維持 | apps/web の import 119 箇所と waoon 独自部品の exports を壊さないため |
| 2026-07-17 | packages/ui の vitest は今回も CI ゲート外のまま（手元実行で担保） | `test` script 追加は破損スイート除外の経緯（CI 除外）と絡むため本 Plan のスコープ外。要否は別途判断 |
| 2026-07-17 | `ban` アイコンは waoon 独自 SVG を維持（実装時の訂正: 上流 lucide-registry にも `Ban` は存在した） | Icon は独自 SVG を registry より優先する設計のため、独自定義維持がそのまま有効 |
| 2026-07-17 | IconButton 上流化（Tooltip 内蔵）に伴い、DataTable Toolbar / ColumnPicker の外側 Tooltip と `title=""` を撤去 | 内蔵 Tooltip と二重表示になるため。tooltip 文言は label と同一で表示は不変 |
| 2026-07-17 | package.json の dead exports 5 件（`./styles` / `./calend/*`）を削除 | 上流の catalog-integrity テストが検出。参照実体なし・apps からの import なし |
| 2026-07-17 | vitest の既存 13 失敗（Toggle / TabBar / LoadingOverlay / Timeline / ToggleableSection / Footer）は修正しない | HEAD（マージ前）でも同一 13 件が失敗することを worktree で確認。既知の破損スイートで本 Plan 起因ではない |
| 2026-07-17 | VERSION_REGISTRY / versions.json に waoon 独自部品 20 件を復帰（コードレビュー指摘） | 上流 JSON 全面置換で欠落していた。version 追跡メタは「現存 export 部品と一致」を方針とする |
| 2026-07-19 | 実装分を 1 commit にまとめ、16 commit 先行した `origin/develop` へ rebase | 依存 major 更新群（TypeScript 6 / Node 24 / vite 8 / puck 移行）が先行マージされたため。スクラッチ worktree での事前試行で衝突が 2 ファイルに限られることを確認済み |
| 2026-07-19 | `packages/ui/package.json` の `dependencies` は develop 側の major 更新を採用し、本 Plan の追加 2 件を重ねる | `@puckeditor/core` / `focus-trap-react` 12 / `isomorphic-dompurify` 3 は develop で移行済み。本 Plan の関心は `lucide-react` / `react-easy-crop` の追加のみで、版数を巻き戻す理由がない |
| 2026-07-19 | `pnpm-lock.yaml` は develop 版を採用し `pnpm install` で再生成 | lockfile は生成物のため手動マージせず、解決済みの `package.json` から導出するのが正しい |
| 2026-07-19 | Phase 5 の検証を新ツールチェーンで全面再実行 | rebase で TypeScript 5.9→6.0.3 / vite 7→8 / focus-trap-react 11→12 / isomorphic-dompurify 2→3 と足回りが変わり、旧 develop 基準の検証結果が無効化されたため |
| 2026-07-19 | vitest の残存 13 失敗（6 スイート）は本 Plan 起因ではないと再確認 | `origin/develop` 単体のベースラインを worktree で実測すると **66 失敗 / 34 スイート**。本マージ後は 13 失敗 / 6 スイートで、失敗スイートはベースラインの部分集合（**新規失敗ゼロ・28 スイートが解消**）。develop の依存 major 更新に既存テストが追随できていない状態を、上流同期が解消した形 |

## ステータス

- [x] Plan 承認（計画レビュー APPROVE + 笹木さん OK）
- [x] Phase 1: 無衝突置換（115 ファイル）
- [x] Phase 2: 衝突マージ（33 ファイル。DataTable / Toast は waoon 版維持）
- [x] Phase 3: 新規部品追加（採用 147 ファイル + barrel 統合・見送り部品 export 除外）
- [x] Phase 4: メタ更新（package.json / versions.json / lockfile）
- [x] Phase 5: 検証（`origin/develop` へ rebase 後、新ツールチェーンで再実行）
  - [x] `pnpm turbo run typecheck lint build test`（CI parity・10 タスク成功）
  - [x] `pnpm -r typecheck`
  - [x] `pnpm --filter @waoon/web build`
  - [x] `pnpm --filter @ui-catalog/core lint`
  - [x] `pnpm --filter @ui-catalog/core exec vitest run`（13 失敗 / 6 スイート。develop ベースライン 66 失敗 / 34 スイートの部分集合で**新規失敗ゼロ・28 スイート解消**）
- [x] PR 作成・レビュー（[#97](https://github.com/sasakiyusuke2017015/waoon/pull/97) merge 済み）
- [ ] **マージ後検証**
  - [ ] dev スタックで主要画面の目視確認（admin 一覧 / ダッシュボード / スケジュール / 回答）
    - [ ] Icon lucide 化で全アイコンが描画される
    - [ ] テーマ 3 軸（rose / sharp / fabric）の見た目が崩れていない
    - [ ] `focus-trap-react` 12 で Modal / Dialog のフォーカストラップが機能する
