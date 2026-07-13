# Review: SubHeaderToolbar Phase 1 — DataTable Toolbar 部品刷新

| 項目 | 値 |
|---|---|
| 対象 Plan | [SubHeaderToolbar](../plans/2026-07-07-1430-subheader-toolbar.md) |
| 種別 | コードレビュー |
| 対象 | feature/subheader-toolbar 未コミット差分 |
| レビュアー | Claude Code (code-reviewer) |
| verdict | **APPROVE** |

## サマリ

DataTable のツールバー・ページャ・件数表示を、apps/web で未使用だった ui-catalog 資産
(`DataCountDisplay` / `Pagination` / `Tooltip` / `Animated`) へ置換した差分をレビューした。
特に指定のあった 0/1-index 変換、Tooltip ラップと Toggleable triggerProps の非破壊性、
DataCountDisplay の分岐整合、SSR 安全性を重点確認した。BLOCKER なし。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | N/A |
| 実装判定 | APPROVE |
| 記録整理 | OK |

## Findings

### 重点確認項目 (いずれも問題なし)

- **0-indexed ⇔ 1-indexed 変換** — `ClientDataTable.tsx:420-423` で
  `currentPage={safePageIndex + 1}` / `onPageChange={(p) => setPage(p - 1)}` と正しく往復変換。
  `Pagination` は `totalPages <= 1` で null を返すが、描画条件が
  `sortedRows.length > pageSize` (= `totalPages >= 2`) なので下限も安全。範囲外クリックは
  `Pagination.handlePageClick` 側でもクランプされ二重防御。
- **Tooltip ラップと triggerProps** — `Tooltip` は children をクローン/加工せず
  `<span class="wrapper">{children}<span role="tooltip"/></span>` で包むだけ。funnel の
  `{...triggerProps}` (aria-expanded / aria-controls / onClick) と ColumnPicker の
  `{...ariaProps}` / `onClick` はいずれも IconButton に直接展開されており、Tooltip は素通し。
  `Toggleable` / `Dropdown` はトリガーの ref 計測ではなくコンテナ相対 (`.relative`) で
  メニューを配置するため、inline-flex な wrapper span を挟んでも開閉・配置は壊れない。
- **DataCountDisplay の分岐** — `loading` → `'...'`、`outOf != null` → `M / N件`、
  それ以外 → `N件` の三分岐が排他で整合。`ClientDataTable` は `hasActiveFilter` 時のみ
  `outOf={rows.length}` を渡し「絞り込み中のみ分数表示」を満たす。`loading` は
  Client/Server 両方に実在する prop で配線ミスなし。
- **SSR / hydration** — `NumberTicker` は `'use client'`、利用元 DataTable も
  `'use client'` 境界内。初期 spring 値は server/client とも `0` に一致するため
  hydration mismatch なし (既存挙動を踏襲、本差分で新規リスクを持ち込んでいない)。
- **dead scss 削除** — `.pageButton` / `.pageInfo` の参照はソースに残存なし
  (`.next` ビルドキャッシュのみ、再ビルドで解消)。
- **IconButton `title`** — `ButtonHTMLAttributes` 由来で型済み。明示 destructure により
  `...props` からの二重適用も回避。`title=""` は `title ?? label` で空文字が保持され
  ネイティブ title を正しく抑止する。
- **vitest polyfill** — `IntersectionObserver` polyfill は `useInView` crash 対策として妥当。

### [NICE-TO-HAVE] Animated がチップを block ラッパで包む

`Toolbar.tsx:223` の `Animated type="scale"` は framer パスで `motion.div` (block) を各チップに
被せる。親 `.filterChips` は `display:flex; flex-wrap:wrap` なので flex item 化して概ね
従来の見た目を保つが、チップ本体は元々 `inline-flex` の span 直挿しだった。表示崩れは
想定しにくいが、Phase 2 の実機確認時に折返し・縦位置を一度目視するとよい。修正案としては
`Animated` に `className={styles.filterChip}` 相当を渡さず現状維持で可 (対応不要)。

### [NICE-TO-HAVE] Animated の `show` が常に true でチップ削除アニメが出ない

`show` ハードコード + `AnimatePresence` 不在のため、チップ削除 (`onRemove`) 時は
scale-out せず即消える。追加アニメのみで意図どおりなら不要。将来チップ退場も演出したい場合は
`AnimatePresence` 導入を別タスクで検討。

### [NICE-TO-HAVE] Tooltip content が aria-label と重複・SR 非参照

`Tooltip content` は IconButton の `label` (= aria-label) と同文で、かつ `role="tooltip"` は
`aria-describedby` で参照されていない (視覚装飾)。アクセシブルネームは aria-label が担うため
実害はない。将来 Tooltip を説明的テキストに使う場合のみ describedby 連携を検討。

### [NICE-TO-HAVE] ServerDataTable の件数表記が「N 件」→「N件」に変化

`DataCountDisplay` 採用で数字と「件」の間の半角スペースが消える。Client 側と表記が揃う
方向なので整合性はむしろ向上。仕様意図どおりなら対応不要。

## 実施した検証

- `git diff` 全対象ファイルの目視レビュー。
- 依存部品 (`Tooltip` / `Pagination` / `Animated` / `NumberTicker` / `Toggleable` /
  `Dropdown` / `DataCountDisplay`) の実装を読み、ラップ・index 変換・配置機構の非破壊性を確認。
- `.pageButton` / `.pageInfo` のソース残存を grep で確認 (ソース参照なし)。
- typecheck / テスト green は Plan 記載の実行結果を前提として受領 (本レビューでは再実行せず)。

### 検証ギャップ

- 実ブラウザでの見た目確認 (チップ折返し・Tooltip 表示位置・NumberTicker アニメ) は未実施。
  Phase 2 の SubHeader 統合時にまとめて目視するのが妥当。

## 対応 Plan

[SubHeaderToolbar Plan](../plans/2026-07-07-1430-subheader-toolbar.md) Phase 1「Toolbar 部品刷新」。
