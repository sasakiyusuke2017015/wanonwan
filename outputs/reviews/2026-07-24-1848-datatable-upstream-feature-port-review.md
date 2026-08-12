# Review: DataTable 上流機能の選択的手移植（コードレビュー）

| 項目 | 値 |
|---|---|
| 対象 Plan | [DataTable 上流機能の選択的手移植](../plans/2026-07-24-1806-datatable-upstream-feature-port.md) |
| 種別 | コードレビュー |
| 対象 | working tree 未 commit 差分（`packages/ui/core/organisms/DataTable/` 10 ファイル + `filterDefs.ts` 新規） |
| レビュアー | Claude Code（code-reviewer） |
| verdict | **APPROVE** |

## サマリ

上流 DataTable の機能（text/numberRange/date フィルタ・`Column.sortValue`・`ClientQueryState.defaultSort`・行削除 disabled・`filterDefs.ts`）を waoon 版へ手移植した差分を、型・ランタイム・テスト・waoon 連携保持の観点で確認した。判別ユニオン分岐、numberRange の null 畳み込み、defaultSort の handleSortClick 分岐、filterHasValue 一元化、leading/toolbar gating/onFilteredCountChange/DataCountDisplay/Pagination の保持に BLOCKER なし。新規 11 テストは意味のある assertion を持ち false-green ではない。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | N/A（計画レビューは本 Review の対象外） |
| 実装判定 | APPROVE |
| 記録整理 | OK |

## Findings

### 確認できた正しさ（重点項目への回答）

1. **判別ユニオン**: `FilterDef = Single | Multi | Text | NumberRange | Date`。select 系は `type?: undefined` で判別子を持たず後方互換を維持。`ClientDataTable` の絞り込み `switch(f.type)` は text/numberRange/date が `continue` で抜け、`default: break` 後に既存の `if (f.multiple)` へ落ちる制御フローで、TS の絞り込みも成立（typecheck green）。Toolbar の描画 `switch` / `buildActiveChips` も同型で破綻なし。既存 select フィルタは無改変で通る。

2. **numberRange の null 畳み込み**: 「未適用 = null」の不変条件が 3 箇所で一貫。
   - Toolbar `Toolbar.tsx:265-266`: 表示は `f.value ?? [min, max]` で全範囲展開、`onChange` は `v[0] <= min && v[1] >= max ? null : v` で全範囲を null へ畳む。
   - ClientDataTable `ClientDataTable.tsx:98`: `if (f.value === null) continue`（未適用スキップ）。
   - `filterDefs.ts:12`: numberRange は `f.value !== null`。
   - `buildActiveChips`（`Toolbar.tsx:104`）の `if (f.value === null) continue` は filterHasValue と冗長に見えるが、`const [lo, hi] = f.value` のための型ナローイングに必要で dead ではない（ClientDataTable 側の同様チェックも同理由）。全範囲タプルを渡すと適用中扱いになる罠は型 doc で明記され、Toolbar 経路では回避されている。

3. **defaultSort の handleSortClick**: `sameSortItems`（値比較・純関数）で「既定状態か」を判定し、`onDefault && !inDefault` のとき baseline を `[]` にして単一ソート化。既定列自身のクリックは通常トグル。uncontrolled では `defaultSort` が常に undefined のため `onDefault=false` で従来挙動、controlled では `queryState.defaultSort` を参照。`setSortItems` は controlled 時 `resolveUpdater(prev=queryState.sortItems)` を通すため updater 内 `prev` が正しく供給される。テスト 2 ケースが期待動作を検証。

4. **filterHasValue 一元化**: Toolbar のローカル定義を削除し `filterDefs.ts` へ集約。Toolbar（チップ/visibleFilters）・ClientDataTable（`hasActiveFilter`）・ServerDataTable（`hasActiveFilter`）が同一関数を使用。絞り込み中判定・チップ・空メッセージ出し分けが揃う。

5. **waoon 連携の保持**: `leading` は collapsible summary（`Toolbar.tsx:382`）と非 collapsible toolbarLeft（`Toolbar.tsx:413`）の 2 箇所で保持。`toolbar='internal'|'external'` gating・`onFilteredCountChange`・`DataCountDisplay`・catalog `Pagination`・`Animated` チップ・`Toggleable` collapse・`--dt-header-*` は差分対象外＝保持。上流の削除を誤って引きずった箇所なし。

6. **テスト**: 新規 11 ケースは実データで in/out を検証しており false-green でない（部分一致・範囲境界・null 未適用・date 前方一致・チップ文言・sortValue の asc/desc 順・defaultSort の単一化とトグル・delete disabled の無効化と非 disabled 経路）。既存 1 件の更新（`ステータス絞込: 1件` → `ステータス絞込`）は FilterField カード化で `selectedLabel` が消えるための妥当な DOM 前提更新。

### [NICE-TO-HAVE] numberRange の既定 max=5 マジックナンバーが 3 箇所に散在

`Toolbar.tsx:257`（`f.max ?? 5`）・`FilterField.tsx:139`（`max = 5`）・`types.ts` の JSDoc（default 5）に同じ 5 が重複。将来ドリフトすると畳み込み境界がズレる。共有定数化 or 型 doc の相互参照を検討（今 PR では contract として一貫しており修正必須ではない）。

### [NICE-TO-HAVE] Animated セル overflow の常時 visible 化による視覚差の目視未確認

判断 A で上流採用した `tableMotion.ts` / `AnimatedDataTableContent.tsx` 改修により、animated テーブルのセルは静止時 `overflow: visible`（アニメ中のみ hidden）。width 固定列で長い内容がセル外へはみ出す可能性がある（Tooltip 表示のための意図的変更）。Plan の「dev スタック目視確認」が未チェックのため、animated + width 指定列の見た目回帰がないかは merge 前後の目視で担保したい。非 animated（`DataTableContent`）は無影響。

### [NICE-TO-HAVE] date フィルタは入力フォーマット検証なし

`ClientDataTable.tsx` の date 絞り込みは `v.startsWith(d)` の前方一致で、`d` が `2026-07` 等の部分文字列でも月単位一致する。仕様上は許容範囲だが、想定外入力（不正日付文字列）でも例外にならず単に 0 件 or 部分一致になる点は挙動として把握しておく。

## セキュリティ

- 攻撃面なし（N/A）。変更は純クライアント UI 部品で、絞り込みはすべて in-memory `Array.filter`。
  外部送信（fetch / SQL / RPC）・`dangerouslySetInnerHTML`・`eval` / `new Function`・秘密情報の
  ハードコードは差分に存在しない（grep 確認済み）。フィルタ値・セル値は React テキストノードとして
  描画され XSS 経路なし。date/text フィルタは文字列前方一致・部分一致で injection 面を持たない。

## 検証

- 差分全体（`review-diff.txt`）と実ファイル（Toolbar / FilterField / FilterField types / ClientDataTable / types）を突き合わせ、型整合（FilterField の numberRange onChange `[number,number]`・select/multiSelect の onChange 文字列変換）を確認。
- Plan 記載のローカル検証（`pnpm -r typecheck` / web build / lint / vitest 168 スイート 1490 test 全 pass、DataTable 143）は再実行せず記録を採用。
- 未検証ギャップ: dev スタックでの admin 一覧目視（SubHeader 連携・テーマ追従・ページャ・animated セル overflow）は Plan 側で未チェックのまま。実装安全性には影響しないが merge 前の手動確認を残課題とする。

## 残課題（後続タスク）

- numberRange 既定 max=5 の共有定数化（NICE-TO-HAVE）。
- animated + width 固定列の overflow 目視（Plan の検証チェックボックスで消化）。
