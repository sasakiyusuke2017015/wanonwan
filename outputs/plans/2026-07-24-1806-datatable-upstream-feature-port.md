# Plan: DataTable 上流機能の選択的手移植（見た目は waoon 版を保持）

| 項目 | 値 |
|---|---|
| 概要 | ui-catalog 上流 DataTable の**機能**（テキスト/数値範囲/日付フィルタ・FilterField UI・`Column.sortValue`・`ClientQueryState.defaultSort`・行削除 disabled・`filterDefs.ts`）を waoon 版 DataTable へ手移植。SubHeaderToolbar 連携・DataCountDisplay/Pagination の catalog 化など waoon 独自の見た目は保持する |
| ステータス | 🟡 実装中（コードレビュー APPROVE・PR 未作成） |
| 前提 Plan | [ui-catalog 上流最新版の選択的マージ](2026-07-16-2354-ui-catalog-upstream-sync.md)（#97。DataTable は waoon 版優先と判断。本 Plan は機能面のみ上流へ寄せる後追い） |
| PR | 未作成 |
| Review | [コードレビュー](../reviews/2026-07-24-1848-datatable-upstream-feature-port-review.md) |

ブランチ: `feature/datatable-upstream-feature-port`（develop 起点・未作成）

## 目的

#97 で DataTable は「waoon 版優先」とし上流差分を取り込まなかった。その後 ai-education 上流
（`ui.zip`）で DataTable に有用な**機能**が入ったため、**丸ごと置換ではなく選択マージ**で機能だけを
waoon 版へ手移植する。方針は「見た目は大きく変えず、機能は上流をメインにする」。

## スコープ

### やること（上流機能の取り込み）

- **フィルタ 3 種の追加**: `TextFilterDef` / `NumberRangeFilterDef` / `DateFilterDef`
  （client モードでの絞り込みロジック込み）。既存の単一/複数 select は `type` 無しで判別を維持
- **FilterField UI 化**: Toolbar のフィルタ入力を `Select` から `@ui-catalog/core` の `FilterField`
  カードへ置換（`FilterField` は #97 で移植済み・上流と 0 差分）。検索もフィルタ定義がある表では
  同じカード外形に揃える
- **`Column.sortValue`**: client ソートの比較キーを行から導出（数値=数値比較 / 文字列=ja localeCompare）
- **`ClientQueryState.defaultSort`**: URL 未指定時の既定ソート。既定状態から既定外列クリック時に
  単一ソートへ切替える `handleSortClick` の分岐込み
- **行削除の `disabled` / `disabledReason`**: 「使用中で消せない」行の削除ボタンを無効化し確認を出さない
- **`filterDefs.ts`（新規）**: `filterHasValue()` を上流からコピー。Toolbar / Client / Server で共有
- **`CollapsibleOptions.title` / `borderColor`（deprecated）を削除**: 上流で削除済み・waoon 消費者なし
- 上記に必要な scss 追加（`.toolbarFilterCard` / `.toolbarSearchCard`、`.toolbarInputs` を
  `align-items: stretch` へ）と、新機能の**テスト追加**

### やらないこと（waoon 版を保持・上流差分を不採用）

- **SubHeaderToolbar 連携の中核**: `toolbar?: 'internal' | 'external'` prop と
  `onFilteredCountChange` は**維持**（上流は削除しているが waoon の AdminListTable が依存）
- **DataCountDisplay / Pagination の catalog 化を維持**: 上流はプレーン文字列＋素の `<button>` ページャに
  戻しているが、waoon は `DataCountDisplay`（NumberTicker 付き）と catalog `Pagination` を保持
- **Toolbar の `leading` prop を維持**: SubHeaderToolbar が画面タイトルを差し込むスロット。
  上流は削除しているが両分岐（collapsible summary / 非 collapsible toolbarLeft）で残す
- **collapsible 機構は `Toggleable` のまま**: 上流は `Collapse` + `useState` + `useOperationLog` へ
  リファクタしているが、`leading` 維持と見た目・低リスクを優先し waoon の `Toggleable` を保持
  （FilterField カードは `Toggleable` の children としてそのまま描画可能）
- **チップの `Animated` ラッパを維持**: 上流は撤去しているが waoon の scale アニメを残す
- **ColumnPicker の見た目**: 上流の `gear→columns-3` アイコン化・`Toggle→Switch` 化は不採用
  （機能要求外の見た目変更）
- **`--dt-header-bg/text` テーマ注入・`--chrome-subheader-h` sticky 追従**: waoon の scss を保持
  （上流は素トークンへ戻している）
- **ai-education 専用の scss**（`.td { height }`・`.tablePlain .td { height: auto }`）は不採用
- admin ページ側への新フィルタ**配線はしない**（機能を*利用可能*にするだけ。現状どのページも
  `filters` / `rowActions` / `sortValue` / `defaultSort` を渡していない）

## 現状コンテキスト（2026-07-24）

- 上流 DataTable との差分は 12 ファイル。net-new は `filterDefs.ts` のみ。
- 消費者は全て `AdminListTable` 経由（admin: users/surveys/questions/answers + interviews + MasterListView）。
  ページは `Column` 型のみ import。新機能は全て optional 追加のため**既存消費者は無改変で通る**。
- `rowActions` は現状 apps/web で**未使用**（削除 disabled 機能は dormant で導入。将来利用に備える）。
- 依存部品（FilterField / Toggleable / DataCountDisplay / Pagination / IconButton）は packages/ui に既存。

## 変更ファイル（packages/ui/core/organisms/DataTable/）

| ファイル | 変更内容 | 保持する waoon 要素 |
|---|---|---|
| `filterDefs.ts` | **新規**（上流コピー） | — |
| `types.ts` | Text/NumberRange/Date FilterDef 追加・`SelectFilterDefBase` 分離・`sortValue`・`defaultSort`・delete `disabled`/`disabledReason` 追加・deprecated `CollapsibleOptions.title/borderColor` 削除 | `toolbar`・`onFilteredCountChange` |
| `Toolbar.tsx` | フィルタ入力を FilterField 化・text/date/numberRange 描画追加・チップ要約に 3 種追加・`filterHasValue` を filterDefs から import | `leading`・`Toggleable`・`Animated` チップ・Input 検索 |
| `ClientDataTable.tsx` | フィルタ type 分岐（絞り込み）・`sortValue` ソート・`defaultSort` handleSortClick・`filterHasValue`・`filterValuesKey` 拡張 | `DataCountDisplay`・catalog `Pagination`・`toolbar` gating・`onFilteredCountChange` |
| `ServerDataTable.tsx` | `filterHasValue` 採用 | `DataCountDisplay`・`toolbar` gating |
| `RowActions.tsx` | delete `disabled`/`disabledReason` 対応 | （下記 判断ポイント A） |
| `DataTable.module.scss` | `.toolbarFilterCard`(10rem)・`.toolbarSearchCard`(14rem) 追加・`.toolbarInputs` を stretch 化 | sticky 追従・`--dt-header-*`・Toggleable セレクタ・catalog ページャ |
| `DataTable.test.tsx` | 新機能テスト追加（下記 判断ポイント B） | 既存テスト |

**触らない**: `AnimatedDataTableContent.tsx`・`tableMotion.ts`・`ColumnPicker.tsx`・
`useColumnVisibilityState.ts`・`index.ts`・`DataTable.tsx`・`DataTableContent.tsx`・`tableCells.tsx` ほか。

## 判断ポイント（承認前に確認）

### A. RowActions の削除 disabled をどう入れるか

上流は削除 `disabled` 追加と同時に、行アクションのツールチップを native `title` から `Tooltip` atom
へ変更している。`Tooltip` atom はセルの `overflow:hidden` に切られるため、上流は
`AnimatedDataTableContent` / `tableMotion` の overflow・z-index も併せて改修している。

- **推奨**: `disabled`/`disabledReason` の**プロップ配線のみ**採用し、ツールチップは native `title` を維持。
  FLIP アニメの overflow/z-index には触れない（最小差分・低リスク。rowActions は現状未使用で見た目影響なし）。
- 代替: 上流 RowActions を丸ごと採用（`Tooltip` atom 化）。その場合 overflow 改修も連動採用。

### B. テストの入れ方

上流 `DataTable.test.tsx` は +437/-109 と大きく、上流の Toolbar(Collapse)/プレーンページャ/文字列件数を
前提とするため**丸ごとコピー不可**。

- **推奨**: 新機能（text/number/date フィルタの絞り込み・`sortValue`・`defaultSort`・delete disabled）の
  テストケースだけを waoon の DOM（FilterField・DataCountDisplay・catalog Pagination）に合わせて**新規追加**。
  既存テストは維持。

## 実装計画

1. **ブランチ作成**（要確認）: develop 起点で `feature/datatable-upstream-feature-port`
2. `filterDefs.ts` を新規作成（上流コピー）
3. `types.ts` を手マージ（追加 6 項目・deprecated 削除・waoon 2 項目保持）→ typecheck
4. `Toolbar.tsx` を手マージ（FilterField 化 + leading/Toggleable/Animated 保持）→ typecheck
5. `ClientDataTable.tsx` / `ServerDataTable.tsx` を手マージ → typecheck
6. `RowActions.tsx`（判断 A の結論に従う）→ typecheck
7. `DataTable.module.scss` に必要 class 追加
8. `DataTable.test.tsx` に新機能テスト追加（判断 B）
9. **検証**（下記）→ `/pr-review` → PR 作成（要確認）

各ステップ後に typecheck を回し、壊れた時点で切り分ける。

## 検証

- `pnpm -r typecheck`（apps/web 消費者の無破壊確認。特に `Column` 型 import）
- `pnpm --filter @waoon/web build`
- `pnpm --filter @ui-catalog/core exec vitest run -- DataTable`（新機能テストと既存 DataTable テストの green）
  - packages/ui の vitest は CI ゲート外（#97 判断ログ）。DataTable スイートは #97 ベースラインの
    失敗 6 スイートに含まれず green のはずなので、追加後も green を維持する
- dev スタックで admin 一覧を目視: 検索/件数/新規作成/リセット/列ピッカーが従来どおり動き、
  SubHeaderToolbar 連携・テーマ追従・ページャが崩れないこと

## リスク

| リスク | 影響 | 緩和策 |
|---|---|---|
| Toolbar 手マージで leading/Toggleable/Animated を落とす | SubHeader 連携・見た目 | マージ後に AdminListTable の subHeader モードを目視。leading の 2 箇所を明示チェック |
| FilterField 化で検索/フィルタの外形が変わる | admin 一覧の見た目 | フィルタ定義がある表のみカード化（現状 admin は filters 未使用 = 検索は従来の Input のまま） |
| types.ts の判別ユニオン変更で既存 select フィルタが型エラー | packages/ui | `type?: undefined` の後方互換分離を上流どおり踏襲。typecheck で検出 |
| 上流テスト前提差（Collapse/プレーンページャ）を引きずる | テスト赤 | 丸ごとコピーせず新規ケースのみ追加（判断 B） |

## 判断ログ

| 日時 | 判断 | 理由 |
|---|---|---|
| 2026-07-24 | 丸ごと置換ではなく機能のみ手移植 | #97 で DataTable は waoon 版優先と確定済み。上流 Toolbar は leading 削除・DataCountDisplay/Pagination を撤去しており、置換すると SubHeader 連携が壊れる |
| 2026-07-24 | collapsible は Toggleable のまま（Collapse 化しない） | leading 維持・見た目温存・低リスク。FilterField は Toggleable children として描画可能で Collapse 化は不要 |
| 2026-07-24 | ColumnPicker の gear→columns-3 / Toggle→Switch は不採用 | 機能要求外の見た目変更。「見た目を保つ」方針 |
| 2026-07-24 | 新フィルタは packages/ui で*利用可能*にするだけで admin ページには配線しない | 現状どのページも filters を渡していない。配線は別タスク |
| 2026-07-24 | 判断 A: RowActions は上流を丸ごと採用（Tooltip atom 化 + overflow/z-index 改修 = AnimatedDataTableContent / tableMotion も連動採用） | 笹木さん選択。機能を上流メインへ寄せる方針。3 ファイルは overflow/tooltip hunk 以外は上流と同一のため wholesale コピー可 |
| 2026-07-24 | 判断 B: テストは新機能ケースのみ waoon DOM に合わせて新規追加（上流 test は丸ごとコピーせず） | 笹木さん選択（推奨どおり）。上流 test は Collapse/プレーンページャ/文字列件数前提で waoon 版と非互換 |
| 2026-07-24 | 既存 test 1 件（列非表示時に filter が残る）を FilterField DOM 前提へ更新 | Select の `selectedLabel`「ステータス絞込: 1件」は FilterField 化で消えるため、ラベル存在で「入力が残る」を確認する形へ |
| 2026-07-24 | ColumnPicker の "gear" 文言は据え置き | waoon は上流の columns-3 化を採用せず gear アイコンのままのため、コメントも正 |

## ステータス

- [x] Plan 承認（笹木さん OK）
- [x] 判断ポイント A / B の確定（A: 上流丸ごと採用 / B: 新機能テストのみ追加）
- [x] ブランチ作成（`feature/datatable-upstream-feature-port`）
- [x] filterDefs.ts 新規（上流コピー）
- [x] types.ts 手マージ（新 6 項目追加・deprecated 削除・waoon 2 項目保持）
- [x] Toolbar.tsx 手マージ（FilterField 化 + leading/Toggleable/Animated 保持）
- [x] Client/ServerDataTable.tsx 手マージ（新機能移植 + DataCountDisplay/Pagination/gating 保持）
- [x] RowActions.tsx（判断 A: 上流丸ごと + Animated/tableMotion 連動）
- [x] scss 追加（`.toolbarFilterCard` / `.toolbarSearchCard` / `.toolbarInputs` stretch）
- [x] テスト追加（判断 B: filter 3 種 / sortValue / defaultSort / delete disabled = 11 ケース）
- [x] 検証（ローカル）
  - [x] `pnpm -r typecheck`（全 workspace green）
  - [x] `pnpm --filter @waoon/web build`（Compiled successfully）
  - [x] `pnpm --filter @ui-catalog/core lint`（クリーン）
  - [x] `pnpm --filter @ui-catalog/core exec vitest run`（**168 スイート / 1490 test 全 pass**。
        #97 ベースラインの 13 失敗は解消済みで、本変更は新規失敗ゼロ。DataTable は 143 = 132 既存 + 11 新規）
  - [ ] dev スタックで admin 一覧の目視確認（未実施）
- [x] コードレビュー（`/pr-review` → APPROVE。BLOCKER なし / NICE-TO-HAVE 3 件は下記残課題）
- [ ] PR 作成（未実施・要確認）
- [ ] 笹木さんマージ承認

## 残課題（NICE-TO-HAVE・後続タスク）

コードレビューで挙がった非ブロッキング項目。差し戻し理由にはならず、後追いで消化する。

- numberRange の既定 `max=5` が Toolbar / FilterField / 型 doc の 3 箇所に散在。共有定数化を検討。
- 判断 A で採用した animated セルの `overflow: visible` 化（Tooltip 非クリップ目的）による、
  width 固定 + animated 列のはみ出し目視確認 → 上記「dev スタック目視」で消化する。
- date フィルタは前方一致のみで入力フォーマット検証なし（`2026-07` 等の部分一致も許容）。仕様上許容。
