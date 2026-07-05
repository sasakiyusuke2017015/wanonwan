import type { ReactNode } from 'react'

import { cn } from '../../utils/cn'

import type { Column, ServerSortItem } from './types'
import styles from './DataTable.module.scss'

/**
 * DataTable のセル描画を静的版 (DataTableContent) とアニメ版
 * (AnimatedDataTableContent) で共有するための純ヘルパ群。
 * th / td / tr といった「外側の要素」だけが両者で異なり、中身の描画は同一。
 */

export const ALIGN_CLASS: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: styles.alignLeft,
  right: styles.alignRight,
  center: styles.alignCenter,
}

/** 0始まりの順位を ①②③… (20 まで) に。超過は (n) 表記。 */
export function circledNumber(index: number): string {
  return index >= 0 && index < 20 ? String.fromCodePoint(0x2460 + index) : `(${index + 1})`
}

/** body セルの中身 (render 関数 or row[key] の文字列化)。 */
export function renderCellContent<TRow>(column: Column<TRow>, row: TRow): ReactNode {
  if (column.render) return column.render(row)
  const value = (row as Record<string, unknown>)[column.key]
  if (value === null || value === undefined) return ''
  return String(value)
}

/** 列ヘッダのソート状態 (クリック可否・順位・昇降) を sortItems から導出する。 */
export function headerSortState<TRow>(
  col: Column<TRow>,
  sortableEnabled: boolean,
  sortItems: ServerSortItem[],
): { isSortable: boolean; sortIdx: number; isSorted: boolean; order: 'asc' | 'desc' | null } {
  const isSortable = Boolean(sortableEnabled && col.sortable)
  const sortIdx = isSortable ? sortItems.findIndex((s) => s.columnKey === col.key) : -1
  const isSorted = sortIdx >= 0
  const order = isSorted ? sortItems[sortIdx].order : null
  return { isSortable, sortIdx, isSorted, order }
}

/** ヘッダ <th> の中身 (ラベル + active ソート指標)。外側の th は呼び出し側が用意する。 */
export function HeaderCellInner<TRow>({
  col,
  isSorted,
  order,
  showSortRank,
  sortIdx,
}: {
  col: Column<TRow>
  isSorted: boolean
  order: 'asc' | 'desc' | null
  showSortRank: boolean
  sortIdx: number
}): ReactNode {
  const align = col.align ?? 'left'
  return (
    <span className={styles.thInner}>
      <span className={cn(styles.thLabel, ALIGN_CLASS[align])}>{col.label}</span>
      {/* ソート指標はカラム右端へ寄せる (active のみ表示。複数キー時は順位 ①②… も) */}
      {isSorted && (
        <span className={styles.sortIcon} aria-hidden="true">
          {showSortRank ? `${circledNumber(sortIdx)} ` : ''}
          {order === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </span>
  )
}
