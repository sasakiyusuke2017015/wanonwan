'use client'

import { type FC, useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { Input } from '../../molecules/Input'
import { Button } from '../../molecules/Button'
import { Checkbox } from '../../atoms/Checkbox'
import styles from './DataTable.module.scss'

export interface DataTableProps {
  /** 全カラムヘッダー */
  headers: string[]
  /** 行データ（各行は headers と同じ順序の文字列配列） */
  rows: string[][]
  /** 表示するカラム名（省略時は全カラム） */
  visibleColumns?: string[]
  /** カラム表示変更時のコールバック */
  onColumnsChange?: (columns: string[]) => void
  /** 行クリック時のコールバック（行インデックス） */
  onRowClick?: (rowIndex: number, row: string[]) => void
  /** 複数選択モード（チェックボックス表示） */
  selectable?: boolean
  /** 選択行の変更コールバック（行インデックスの Set） */
  onSelectionChange?: (selected: Set<number>) => void
  /** ヘッダーの表示ラベル（キー=カラム名, 値=表示名） */
  headerLabels?: Record<string, string>
  /** セル値の変換マップ（キー=カラム名, 値={rawValue: displayLabel}） */
  cellLabels?: Record<string, Record<string, string>>
  /** 追加クラス */
  className?: string
  /** 1ページあたりの行数（省略時は 50） */
  pageSize?: number
}

type SortOrder = 'asc' | 'desc' | null

const PAGE_SIZE_OPTIONS = [25, 50, 100]

export const DataTable: FC<DataTableProps> = ({
  headers,
  rows,
  visibleColumns,
  onColumnsChange,
  onRowClick,
  selectable = false,
  onSelectionChange,
  headerLabels,
  cellLabels,
  className,
  pageSize: defaultPageSize = 50,
}) => {
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [filterText, setFilterText] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const pickerRef = useRef<HTMLDivElement>(null)

  // 表示カラムのインデックスを計算
  const activeColumns = visibleColumns ?? headers
  const columnIndices = activeColumns
    .map((col) => headers.indexOf(col))
    .filter((i) => i !== -1)

  // フィルタ
  const filteredRows = useMemo(() => {
    if (!filterText) return rows
    const lower = filterText.toLowerCase()
    return rows.filter((row) =>
      columnIndices.some((ci) => (row[ci] ?? '').toLowerCase().includes(lower))
    )
  }, [rows, filterText, columnIndices])

  // ソート
  const sortedRows = useMemo(() => {
    if (sortColumn === null || sortOrder === null) return filteredRows
    const sorted = [...filteredRows]
    sorted.sort((a, b) => {
      const av = a[sortColumn] ?? ''
      const bv = b[sortColumn] ?? ''
      // 数値比較を試みる
      const an = Number(av)
      const bn = Number(bv)
      if (!isNaN(an) && !isNaN(bn) && av !== '' && bv !== '') {
        return sortOrder === 'asc' ? an - bn : bn - an
      }
      const cmp = av.localeCompare(bv, 'ja')
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [filteredRows, sortColumn, sortOrder])

  // ページネーション
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const safePageIndex = Math.min(page, totalPages - 1)
  const displayRows = sortedRows.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize)

  // フィルタ変更時にページをリセット
  useEffect(() => { setPage(0) }, [filterText, sortColumn, sortOrder])

  // 外側クリックで閉じる
  useEffect(() => {
    if (!showColumnPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowColumnPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColumnPicker])

  if (headers.length === 0) return null

  function toggleRowSelection(rowIndex: number) {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowIndex)) next.delete(rowIndex)
      else next.add(rowIndex)
      onSelectionChange?.(next)
      return next
    })
  }

  function toggleAllSelection() {
    if (selectedRows.size === sortedRows.length) {
      setSelectedRows(new Set())
      onSelectionChange?.(new Set())
    } else {
      const all = new Set(sortedRows.map((_, i) => i))
      setSelectedRows(all)
      onSelectionChange?.(all)
    }
  }

  function handleSort(ci: number) {
    if (sortColumn === ci) {
      if (sortOrder === 'asc') setSortOrder('desc')
      else if (sortOrder === 'desc') { setSortColumn(null); setSortOrder(null) }
    } else {
      setSortColumn(ci)
      setSortOrder('asc')
    }
  }

  function toggleColumn(col: string) {
    if (!onColumnsChange) return
    const current = visibleColumns ?? headers
    const next = current.includes(col)
      ? current.filter((c) => c !== col)
      : [...current, col]
    onColumnsChange(next)
  }

  return (
    <div className={cn(styles.wrapper, className)} data-component="data-table">
      {/* ツールバー */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Input
            type="text"
            className={styles.searchInput}
            placeholder="検索..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            size="small"
          />
          <span className={styles.rowCount}>
            {selectedRows.size > 0
              ? `${selectedRows.size} 件選択中`
              : filterText ? `${sortedRows.length} / ${rows.length} 件` : `${rows.length} 件`}
          </span>
        </div>
        <div className={styles.toolbarRight}>
          {onColumnsChange && (
            <div className={styles.pickerContainer} ref={pickerRef}>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowColumnPicker((v) => !v)}
                title="表示カラム設定"
                className={styles.gearButton}
              >
                ⚙
              </Button>
              {showColumnPicker && (
                <div className={styles.picker}>
                  {headers.map((h) => (
                    <Checkbox
                      key={h}
                      label={headerLabels?.[h] ?? h}
                      checked={activeColumns.includes(h)}
                      onChange={() => toggleColumn(h)}
                      size="small"
                      className={styles.pickerItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* テーブル */}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {selectable && (
                <th className={styles.th} style={{ width: 32 }}>
                  <Checkbox
                    checked={selectedRows.size === sortedRows.length && sortedRows.length > 0}
                    onChange={toggleAllSelection}
                    size="small"
                  />
                </th>
              )}
              {columnIndices.map((ci) => (
                <th
                  key={ci}
                  className={cn(styles.th, styles.thSortable)}
                  onClick={() => handleSort(ci)}
                >
                  <span>{headerLabels?.[headers[ci]] ?? headers[ci]}</span>
                  <span className={styles.sortIcon}>
                    {sortColumn === ci
                      ? sortOrder === 'asc' ? '▲' : '▼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, ri) => {
              const globalIndex = safePageIndex * pageSize + ri
              return (
              <tr
                key={ri}
                className={cn(styles.tr, onRowClick && styles.trClickable, selectedRows.has(globalIndex) && styles.trSelected)}
                onClick={onRowClick ? () => onRowClick(globalIndex, row) : undefined}
              >
                {selectable && (
                  <td className={styles.td} style={{ width: 32 }} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(globalIndex)}
                      onChange={() => toggleRowSelection(globalIndex)}
                      size="small"
                    />
                  </td>
                )}
                {columnIndices.map((ci) => {
                  const raw = row[ci] ?? ''
                  const colName = headers[ci]
                  const display = cellLabels?.[colName]?.[raw] ?? raw
                  // 改行を含む場合は1行目のみ表示
                  const firstLine = display.includes('\n') ? display.split('\n')[0] + '…' : display
                  return (
                    <td key={ci} className={styles.td} title={display !== firstLine ? display : undefined}>
                      {firstLine}
                    </td>
                  )
                })}
              </tr>
              )
            })}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={columnIndices.length + (selectable ? 1 : 0)} className={styles.emptyRow}>
                  {filterText ? '該当するデータがありません' : 'データなし'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {sortedRows.length > pageSize && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            size="small"
            disabled={safePageIndex === 0}
            onClick={() => setPage((p) => p - 1)}
            className={styles.pageButton}
          >
            ‹
          </Button>
          <span className={styles.pageInfo}>
            {safePageIndex + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="small"
            disabled={safePageIndex >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className={styles.pageButton}
          >
            ›
          </Button>
          <select
            className={styles.pageSizeSelect}
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} 件</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

