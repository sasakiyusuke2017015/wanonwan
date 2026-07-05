# コードレビュー: テーマ3 PR-B「admin 一覧の DataTable 一本化」

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 17:20 JST |
| 対象 | `feature/datatable-adoption`（PR-B・未 merge） |
| 対応 Plan | [2026-07-05-0920-datatable-port.md](../plans/2026-07-05-0920-datatable-port.md) |
| レビュア | Claude Code エージェント代行（`code-reviewer` + `architect` 並列・笹木さん明示指示） |

## Verdict

| 軸 | 判定 |
|---|---|
| 最終判定 | **APPROVE** |
| Plan 判定 | N/A（計画レビューは [別ファイル](2026-07-05-0925-datatable-port-review.md) で APPROVE 済み） |
| 実装判定 | **APPROVE**（BLOCKER なし） |
| 記録整理 | OK |

両レビュア（コード品質観点 + 設計観点）とも **BLOCKER ゼロで APPROVE**。指摘はすべて `[NICE-TO-HAVE]`。

## 検証済み（レビュアが突合確認）

- テーマ追従: 外側 `<div style={themeVars}>` の `--dt-header-bg`/`--dt-header-text`/`--border-radius-default` は CSS カスタムプロパティ継承で子孫の `.th` / `.wrapper` へ確実に cascade。`--color-text`（セル本文）は無汚染。`cardRadius` は単位付き文字列で CSS 変数値として有効。
- 列移行: `width:'NN%'` の合計が全一覧で 100（比率保持）。`key`/`align` の取り違え・欠落なし。
- ソート/検索/リトライ: `sortable` の key が実在列に一致・数値列は数値ソート経路。error 時に `onRetry`→`refetch()` を実際に呼ぶ（表示だけの空 handler ではない）。全 5 呼び出し元で配線済み。
- 削除の安全性: `filter-sort` / `InteractiveTable` / `TableRowData` / `heightOffsetCss` / `proportion` 等の残参照 0 件。
- hydration ガード・hooks 規約・イミュータビリティ問題なし。
- 設計: scoped 注入 vs グローバルブリッジのトレードオフ判断は妥当。ヘッダ専用フック分離は light テーマでのセル本文巻き添えを構造的に防止。catalog additive SCSS を PR-B 同梱するのは高凝集で正しい（消費者のいない dead hook の先行 merge を避ける）。

## 反映済み（このレビューを受けて修正）

- `searchKeys`（内容が無視され「列を絞る」と誤読させる）→ **`searchable?: boolean`** に改名し、dead な `SEARCH_KEYS` 定数を全ページ削除。`MasterConfig.searchKeys` も削除。
- `sortable: SortOption[]` の未使用 `label` → **`sortable?: string[]`（key のみ）** に簡素化。
- `themeVars` を **`useMemo`** 化（他の派生値と統一）。

## 残課題（NICE-TO-HAVE・後続タスク）

- テーマ写像（theme→`--dt-*`）を再利用可能な primitive（`useDataTableThemeVars()` フック or `ThemedDataTable` 薄ラッパ）に括り出す。2 人目の DataTable 直利用が現れたときのコピペ再発防止。単一利用の現状は YAGNI で見送り可。
- `--dt-header-*` の注入契約を DataTable の stories / 型 doc に一行記載（catalog-only 消費者が発見できるように）。
- **列ピッカー（gear）と件数セレクトが admin 一覧に新規出現**（DataTable 既定）。意図どおりか笹木さん確認。不要なら `disableColumnPicker` を渡す。
- portal 要素（列ピッカー popover 等）は wrapper の CSS 変数を継承しないため角丸だけテーマ非追従（scoped 注入の既知の代償・実害軽微）。
- `.thSortable:hover` の白オーバーレイが light テーマ（明色ヘッダ）で視認弱い（PR-A 本体側・別 Issue）。
- InteractiveTable の catalog 残置/削除を無期限保留にせず期限付き yes/no へ格上げ（役割は DataTable と非冗長。需要が無ければ evergreen で削除）。
