# Plan: SubHeaderToolbar — DataTable の funnel 開閉 Toolbar を SubHeader chrome に統合

| 項目 | 値 |
|---|---|
| 概要 | DataTable (ai_edu 由来) の funnel 開閉 Toolbar と SubHeader の固定 chrome を合成した SubHeaderToolbar を新設し、未使用の ui-catalog 資産 (FilterField / DataCountDisplay / Pagination / SearchBar / ResetButton / Badge / Tooltip / Animated 等) を積極採用してテーブル体験を刷新する |
| ステータス | 🟢 マージ済み（検証中） |
| 前提 Plan | [DataTable 移植](2026-07-05-0920-datatable-port.md) |
| PR | [#81](https://github.com/sasakiyusuke2017015/waoon/pull/81)（merged）/ lint fix: [#84](https://github.com/sasakiyusuke2017015/waoon/pull/84)（merged） |
| Review | [Phase 1](../reviews/2026-07-07-1822-subheader-toolbar-review.md) / [Phase 2](../reviews/2026-07-07-1920-subheader-toolbar-review.md) / [Phase 3](../reviews/2026-07-07-2010-subheader-toolbar-review.md) |

## 目的

テーブル画面の検索・フィルタ操作を Header 直下の固定 SubHeader 領域へ移し、funnel アイコンで
開閉するスライド展開 UI に統合する。閉状態ではテーブルが縦領域を最大限使え、開状態では
フィルタ群が chrome として画面上部に常駐する。あわせて apps/web で未使用の ui-catalog 資産を
積極採用し、件数・ページャ・チップ等の見た目を刷新する。

## スコープ

### やること

1. **DataTable Toolbar の部品刷新**（SubHeader 非依存で先行できる部分）
   - 件数表示 (`rowCountLabel` の素の span) → `DataCountDisplay`（NumberTicker アニメ付き）
   - funnel ボタンに `Badge` で適用中フィルタ数を表示 + `Tooltip` 付与
   - `ClientDataTable` の手組みページャ（`‹` `›` Button + select）→ `Pagination` molecule
     （`ServerDataTable` は採用済み。client/server の見た目を揃える）
   - 検索 box / リセット: `SearchBar` / `ResetButton` の採否を実物比較で判断（判断ログに残す）
   - チップの追加・削除 / フィルタ行の開閉に `Animated` を適用
2. **SubHeaderToolbar テンプレート新設**（`packages/ui/core/templates/SubHeaderToolbar/`）
   - `SubHeader`（fixed・サイドナビ追従の left transition）+ DataTable `Toolbar` の合成
   - funnel クリックで SubHeader の高さがスライド伸縮（既存 `Toggleable` を controlled で流用）
   - 実高を ResizeObserver で CSS 変数（`--subheader-h`）へ書き出し、本文 offset を連動
3. **AppLayout に SubHeader スロット機構**
   - React context でページから SubHeader 中身を注入（未注入ページは現行の画面名表示のまま）
4. **DataTable の Toolbar 外部化オプション**
   - 内蔵 Toolbar を出さず外部（SubHeaderToolbar）に描画する prop を追加。
     フィルタ state 共有は既存の controlled `filters` / `queryState` をそのまま使う
5. **`FilterField` の採用評価**
   - select 以外のフィルタ型（日付 / 日付範囲 / 範囲入力）を統一デザインで供給できる。
     まず見た目の統一に使えるか比較し、型拡張（`FilterDef` への date 型追加）は需要があれば
6. **apps/web への先行適用**: admin/users 一覧 1 画面（`AdminListTable` に opt-in で追加）
7. Storybook stories + vitest（既存 DataTable.test.tsx の追随含む）

### やらないこと（スコープ外）

- 全テーブル画面への一斉適用（先行 1 画面 + 展開は後続）
- `FilterField` 全型（score 範囲等）の DataTable 統合（必要になった型だけ）
- モバイル最適化の作り込み（閉状態デフォルト + 崩れないことの確認まで）
- 既存の内蔵 Toolbar（`collapsible`）利用画面の挙動変更（後方互換を維持）

## 現状コンテキスト（2026-07-07 時点）

- [DataTable](../../packages/ui/core/organisms/DataTable/): client/server 2 モード。
  [Toolbar.tsx](../../packages/ui/core/organisms/DataTable/Toolbar.tsx) は `collapsible` で
  funnel アイコン + `Toggleable` によるフィルタ行開閉を内蔵。閉時もチップ要約・件数・リセットは常時表示。
  [useStickyToolbarOffset.ts](../../packages/ui/core/organisms/DataTable/useStickyToolbarOffset.ts) が
  Toolbar 実高を `--dt-toolbar-h` に書き出し、ヘッダ行が sticky 吸着する
- [SubHeader](../../packages/ui/core/templates/SubHeader/SubHeader.tsx): fixed の薄いコンテナ。
  `left` 300ms transition でサイドナビ開閉に追従。
  [AppLayout.tsx](../../apps/web/components/layout/AppLayout.tsx) が高さ 44px 固定で画面名のみ表示
- apps/web のテーブルは [AdminListTable.tsx](../../apps/web/components/admin/AdminListTable.tsx)
  （client モードの定石ラッパ）経由で admin の users / surveys / questions / answers 一覧が使用
- apps/web 未使用の ui-catalog 資産（本 Plan の採用候補）: `FilterField` `DataCountDisplay`
  `SearchBar` `ResetButton` `TagItem` `Segment` `ViewModeToggle`（molecules）、
  `Badge`（stories のみ）`Tooltip` `Animated`（atoms）、`Pagination`（client 側未採用）

## 実装計画

- **Phase 1: Toolbar 部品刷新**（DataTable 内で完結、SubHeader 非依存）
  1. `DataCountDisplay` / `Badge` / `Tooltip` / `Pagination` / `Animated` を Toolbar・ClientDataTable に適用
  2. `SearchBar` / `ResetButton` の採否判断 → 判断ログ記録
  3. 既存テスト・stories 追随
- **Phase 2: SubHeaderToolbar + スロット機構**
  1. `SubHeaderToolbar` テンプレート新設（開閉スライド + 高さ変数書き出し）
  2. AppLayout に SubHeader slot context
  3. DataTable に Toolbar 外部化 prop
  4. stories + テスト
- **Phase 3: apps/web 適用**
  1. admin/users 一覧へ opt-in 適用、実機で開閉・追従・sticky を確認
  2. 問題なければ残り admin 一覧へ展開（別コミット）

Phase 1 は単独でも価値があるため、Phase 単位で PR を分割してよい（1 PR 目 = Phase 1）。

## 検証

- `turbo run typecheck` / `pnpm --filter @ui-catalog/core test`（DataTable 既存テスト回帰）
- Storybook で SubHeaderToolbar の開閉・チップ・件数アニメを目視確認
- `apps/web` dev 起動 → admin/users で: funnel 開閉で本文がガタつかない / サイドナビ開閉に
  SubHeader が追従 / スクロール時のヘッダ行 sticky 位置が正しい / hydration warning なし
- モバイル幅で閉状態デフォルト・展開時に崩れないこと

## リスク

| リスク | 緩和策 |
|---|---|
| `SUBHEADER_HEIGHT=44` 固定前提が崩れ、本文 offset がガタつく | 実高を CSS 変数化し transition で追従。SSR 初期高は閉状態の 44px に固定し hydration mismatch を回避 |
| Toolbar が SubHeader へ移ると `--dt-toolbar-h` ベースの sticky 吸着計算がずれる | 外部化時は `--dt-toolbar-h` を 0 にし、SubHeader 実高を sticky top に加算する経路を追加 |
| `Toggleable` は開くたび contentKey で remount → 検索 input の focus/値が消える懸念 | controlled モードで検証し、問題があれば remount 抑止オプションを Toggleable に追加 |
| `NumberTicker` 等アニメ資産の依存追加で bundle 増 | 既存 ui-catalog 内資産のみ使用（外部依存追加なし）を確認 |
| 未使用資産が現行テーマ（CSS 変数）に未対応の可能性 | 採用前に stories で見た目確認し、合わないものは無理に使わない（判断ログへ） |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-07 | apps/web 未使用の ui-catalog 資産を積極採用する | ユーザー指示。使い捨て部品を作らず catalog へ吸収する CLAUDE.md 方針とも整合 |
| 2026-07-07 | 開閉ロジックは新規実装せず既存 `Toggleable` を controlled で流用 | funnel 開閉・aria 対応・devtools ログが実装済み。二重実装を避ける |
| 2026-07-07 | `SubHeaderToolbar` は templates 層に置く | SubHeader と同じ chrome 部品であり、organisms(DataTable) と templates(SubHeader) の合成のため |
| 2026-07-07 | funnel への `Badge`(適用中フィルタ数) は見送り | DataTable 移植時に「バッジ廃止・チップ要約に一本化」の判断済み (テストに明記)。チップが常時表示で数の情報は重複する |
| 2026-07-07 | `SearchBar` は Toolbar に不採用 | 高さ 3rem / radius-xl のページレベル検索デザインで、`Input size="small"` の密な Toolbar と縮尺が合わない。スタイル上書きしてまで使うと「統一デザイン」の意義が消える。Phase 2 の SubHeader 展開面では再検討 |
| 2026-07-07 | `ResetButton` は Toolbar に不採用 | テキストラベル付き Button で、funnel/gear/＋ が並ぶ 16px IconButton 列のリズムを崩す。IconButton + `Tooltip` で統一 |
| 2026-07-07 | `TagItem` はチップに不採用 | ドラッグ並べ替え + チェック選択 + カラードットのタグ管理 UI で、削除可能なフィルタ要約チップとは責務が異なる |
| 2026-07-07 | チップの Animated は framer パス (`type="scale"`) を使用 | CSS keyframes 版 (`category="card"`) は `@keyframes` 定義 (styles/globals.css) を apps/web が読み込んでおらず opacity:0 のまま残るため |
| 2026-07-07 | vitest.setup.ts に IntersectionObserver polyfill を追加 | NumberTicker (framer useInView) が jsdom で crash する。`DataCountDisplay` の既存テスト 3 件は HEAD 時点で failing だった (未使用部品ゆえ露見せず) — polyfill で解消 |
| 2026-07-07 | SubHeader スロットは createPortal 方式 (`SubHeaderPortal`) | context に ReactNode を setState で流す方式は「描画毎に新しい node → effect → setState」の再レンダーループの温床。portal なら検索値等の state をページ側ツリーに置いたまま chrome に描ける |
| 2026-07-07 | SubHeaderToolbar は既存 `Toolbar` を `leading` スロット付きで再利用 | funnel 開閉・チップ・右端コントロールの実装を二重化しない。SubHeader 用のクローム差分は wrapper の SCSS (`[data-dt-toolbar]` の sticky/境界打ち消し) だけに閉じる |
| 2026-07-07 | AppLayout から `--topbar-h` を配線し本文 paddingTop を SubHeader 実高に追従 | `--topbar-h` は未設定 (fallback 0) で、DataTable の sticky ヘッダがスクロール時に fixed chrome の下へ潜る潜在問題があった。ResizeObserver の実測値 (Header + SubHeader 実高) を渡して解消し、funnel 展開時の本文ガタつきも防ぐ |
| 2026-07-07 | **`--topbar-h` 配線を取り下げ** (paddingTop 追従は維持) | Phase 3 実機確認 (headless Chromium) で、ヘッダ行が静止状態でもテーブル中段へ約 topbar 分ずれる表示バグを発見。実測の結果、main が独自スクロールする本レイアウトでは **sticky の停留基準が main の paddingTop (= chrome 高) を既に織り込む** ため、`--topbar-h` を足すと二重適用になる。「fallback 0 で潜り込む」という上記判断は誤りで、0 が正 (潜り込みは padding が防いでいた)。--topbar-h は body スクロールのレイアウト用として温存 |
| 2026-07-07 | 絞り込み後件数は `onFilteredCountChange` callback で DataTable から公開 | Phase 3 コードレビューの BLOCKER。`toolbar="external"` では絞り込み後件数が DataTable 内部にしか無く、SubHeader の件数が「表示: 12件」のまま可視行 (1 行) と矛盾していた。フィルタロジックを app 側へ複製せず、callback で件数だけ公開して「表示: M / N件」を復元 |
| 2026-07-07 | SubHeaderToolbar の title は `h1` で描画 | ページ見出しを SubHeader へ移設するとページから heading 要素が消え、スクリーンリーダーの見出しナビゲーションが効かなくなるため (レビュー指摘) |

## 未確定事項（任意・未決のみ）

- `FilterField` の日付/範囲型を今回の適用画面で使うか（admin 一覧に日付フィルタ需要があるか）
- SubHeader 内で `Segment` / `ViewModeToggle` による表示切替（テーブル/カード等）まで入れるか
- `SearchBar` を Phase 2 の SubHeader 展開面（広い面）で使うか

## 残課題（任意）

- 残り admin 一覧（surveys / questions / answers）への展開（Phase 3-2、別コミット）
- `subHeader.createHref` を `onCreate` なしで単独指定するとボタンが出ない（JSDoc で
  併用必須と明記済み。union 型での強制は見送り）
- ルート `.prettierrc.json`（semi:true / double quote）が packages/ui の実スタイル
  （no-semi / single quote）と食い違っており、prettier を実行すると触れたファイルだけ
  スタイルが割れる。config を実スタイルへ合わせるか `style:` の一括整形 commit で解消する
  （本 Plan のコードレビュー [NICE-TO-HAVE] 指摘。今回は churn を revert して回避）

## ステータス

- [x] Phase 1: Toolbar 部品刷新
- [x] Phase 2: SubHeaderToolbar + スロット機構
- [x] Phase 3: admin/users 適用
- [x] PR merge 済み（#81 / lint fix #84）
- [x] 検証: 実機確認（開閉 / 追従 / sticky / hydration。headless Chromium で
  ログイン → admin/users → funnel 開閉 / 検索絞り込み / チップ解除 / リセット / ＋ボタン /
  本文 paddingTop 追従 (92→114px) を確認。console error なし）
