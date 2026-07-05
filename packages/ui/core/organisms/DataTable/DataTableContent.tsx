'use client'

import { Checkbox } from '../../atoms/Checkbox'
import { cn } from '../../utils/cn'

import { AnimatedDataTableContent } from './AnimatedDataTableContent'
import { ALIGN_CLASS, HeaderCellInner, headerSortState, renderCellContent } from './tableCells'
import type { TableAnimationVariant } from './tableMotion'
import type { Column, ServerSortItem } from './types'
import styles from './DataTable.module.scss'

export interface DataTableContentProps<TRow> {
  columns: Column<TRow>[]
  rows: TRow[]
  getRowKey?: (row: TRow, index: number) => string | number
  onRowClick?: (row: TRow, index: number) => void
  selectable?: boolean
  selected?: Set<number>
  isAllSelected?: boolean
  onToggleOne?: (index: number) => void
  onToggleAll?: () => void
  /**
   * 行キー基準の controlled 選択 (client モード)。指定時は index 選択 (`selected`) ではなく
   * `selectedKeys.has(getRowKey(row))` で checked を判定する。`getRowKey` 併用が前提。
   */
  selectedKeys?: Set<string | number>
  /** key 選択モードの単一行トグル (key + row)。 */
  onToggleRowKey?: (key: string | number, row: TRow) => void
  /** false を返す行は checkbox を disabled にする (例: コース修了済み)。 */
  isRowSelectable?: (row: TRow) => boolean
  tableClassName?: string
  rowClassName?: string | ((row: TRow, index: number) => string)
  emptyMessage?: string
  /** 列間の縦罫線 (default: true) */
  bordered?: boolean
  /** 偶数行 zebra (default: true) */
  striped?: boolean
  /** 見た目バリアント (default: 'default')。'plain' はヘッダ淡色の軽量版 */
  variant?: 'default' | 'plain'
  /** true のときだけソート可能ヘッダ (クリック領域 + 順位 + 矢印) を出す */
  sortableEnabled?: boolean
  /** 優先順の active ソートキー (先頭が第1キー)。複数列ソート対応 */
  sortItems?: ServerSortItem[]
  onSortClick?: (columnKey: string) => void
  /** 行/列の表示・非表示をアニメーション化する (default: false) */
  animated?: boolean
  /** アニメーションの種類 (default: 'slideDown') */
  animationVariant?: TableAnimationVariant
  /**
   * 直近の行入れ替えがページ送り (page / pageSize 変更) 由来か。true のとき、退場する行は
   * フィルタ摘出の「右スライド」ではなく即時除去にして、ページ切替のノイズを消す。
   */
  paginating?: boolean
  /**
   * tbody の行をスケルトン (待機アニメ) に差し替える (default: false)。
   * thead は保持するので、黒帯の列見出し・列幅・toolbar はそのまま残る。
   */
  loading?: boolean
}

/** loading 中に tbody へ並べるスケルトン行数。 */
const SKELETON_ROW_COUNT = 8
/** セル内スケルトンバーの幅。列ごとに循環させて単調さを避ける。 */
const SKELETON_BAR_WIDTHS = ['72%', '54%', '84%', '46%', '64%', '78%']

/**
 * フィルタ状態に応じて空メッセージを解決する。
 * フィルタ/検索が効いていて `emptyFilteredMessage` が指定されているときだけそれを出し、
 * それ以外は `emptyMessage` (未指定なら DataTableContent 既定の 'データなし') を出す。
 * 「まだ無い」と「条件に一致しない」の出し分けを各呼び出し元ではなく DataTable に集約する。
 */
export function resolveEmptyMessage(
  hasActiveFilter: boolean,
  emptyMessage: string | undefined,
  emptyFilteredMessage: string | undefined,
): string | undefined {
  if (hasActiveFilter && emptyFilteredMessage != null) return emptyFilteredMessage
  return emptyMessage
}

export function DataTableContent<TRow>(props: DataTableContentProps<TRow>) {
  // loading 中はヘッダを保ったままボディだけスケルトン化したいので、animated 経路は
  // バイパスして static (skeleton 対応) 側を使う。
  if (props.loading) {
    return <StaticDataTableContent {...props} />
  }
  if (props.animated) {
    return <AnimatedDataTableContent {...props} />
  }
  return <StaticDataTableContent {...props} />
}

function StaticDataTableContent<TRow>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectable = false,
  selected,
  isAllSelected = false,
  onToggleOne,
  onToggleAll,
  selectedKeys,
  onToggleRowKey,
  isRowSelectable,
  tableClassName,
  rowClassName,
  emptyMessage = 'データなし',
  bordered = true,
  striped = true,
  variant = 'default',
  sortableEnabled = false,
  sortItems = [],
  onSortClick,
  loading = false,
}: DataTableContentProps<TRow>) {
  const colSpan = columns.length + (selectable ? 1 : 0)
  const showSortRank = sortItems.length > 1
  // key 選択モード: index 選択 (`selected`) ではなく安定キーで checked を判定する。
  const keyMode = selectedKeys != null

  return (
    <div className={styles.tableScroll}>
      <table
        className={cn(
          styles.table,
          bordered && styles.tableBordered,
          striped && styles.tableStriped,
          variant === 'plain' && styles.tablePlain,
          tableClassName,
        )}
      >
        <thead>
          <tr>
            {selectable && (
              <th className={styles.th} style={{ width: 32 }}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={() => onToggleAll?.()}
                  size="small"
                />
              </th>
            )}
            {columns.map((col) => {
              const { isSortable, sortIdx, isSorted, order } = headerSortState(
                col,
                sortableEnabled,
                sortItems,
              )
              return (
                <th
                  key={col.key}
                  className={cn(
                    styles.th,
                    isSortable && styles.thSortable,
                    col.headerClassName,
                  )}
                  style={col.width !== undefined ? { width: col.width } : undefined}
                  onClick={isSortable ? () => onSortClick?.(col.key) : undefined}
                  aria-sort={
                    isSorted ? (order === 'desc' ? 'descending' : 'ascending') : undefined
                  }
                >
                  <HeaderCellInner
                    col={col}
                    isSorted={isSorted}
                    order={order}
                    showSortRank={showSortRank}
                    sortIdx={sortIdx}
                  />
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className={styles.tr} aria-hidden>
                {selectable && (
                  <td className={styles.td} style={{ width: 32 }}>
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200/70" />
                  </td>
                )}
                {columns.map((col, colIndex) => (
                  <td key={col.key} className={cn(styles.td, ALIGN_CLASS[col.align ?? 'left'])}>
                    <div
                      className="h-4 animate-pulse rounded bg-gray-200/70"
                      style={{ width: SKELETON_BAR_WIDTHS[colIndex % SKELETON_BAR_WIDTHS.length] }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className={styles.emptyRow}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const key = getRowKey ? getRowKey(row, index) : index
              const isRowSelected = keyMode ? selectedKeys.has(key) : (selected?.has(index) ?? false)
              const rowSelectable = keyMode ? (isRowSelectable?.(row) ?? true) : true
              const computedRowClass =
                typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName
              return (
                <tr
                  key={key}
                  className={cn(
                    styles.tr,
                    onRowClick && styles.trClickable,
                    isRowSelected && styles.trSelected,
                    computedRowClass,
                  )}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {selectable && (
                    <td
                      className={styles.td}
                      style={{ width: 32 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isRowSelected}
                        disabled={!rowSelectable}
                        onChange={() => {
                          if (!rowSelectable) return
                          if (keyMode) onToggleRowKey?.(key, row)
                          else onToggleOne?.(index)
                        }}
                        size="small"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const align = col.align ?? 'left'
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          styles.td,
                          ALIGN_CLASS[align],
                          col.cellClassName,
                        )}
                      >
                        {renderCellContent(col, row)}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
