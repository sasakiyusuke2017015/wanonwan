'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { DataCountDisplay } from '../../molecules/DataCountDisplay'
import { Pagination } from '../../molecules/Pagination'
import { cn } from '../../utils/cn'

import { ColumnPicker } from './ColumnPicker'
import { resolveVisibleColumns } from './columnVisibility'
import { DataTableContent, resolveEmptyMessage } from './DataTableContent'
import { RowActionsCell, resolveDefaultRowActionHandler } from './RowActions'
import { Toolbar } from './Toolbar'
import { ROW_ACTIONS_KEY } from './types'
import type { ClientDataTableProps, Column, ServerSortItem } from './types'
import { useColumnVisibilityState } from './useColumnVisibilityState'
import { useSelection } from './useSelection'
import { useStickyToolbarOffset } from './useStickyToolbarOffset'
import styles from './DataTable.module.scss'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500, 1000]

// React の setState と同じ「値 or updater 関数」を受ける型。controlled 経路で
// updater を現在値に対して解決するために使う。
type SetState<T> = T | ((prev: T) => T)
function resolveUpdater<T>(next: SetState<T>, prev: T): T {
  return typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
}

function cellTextValue<TRow>(column: Column<TRow>, row: TRow): string {
  const value = (row as Record<string, unknown>)[column.key]
  if (value === null || value === undefined) return ''
  return String(value)
}

// filter 突合用に、行の `key` の値を文字列集合に正規化する。
// - スカラ (id / 文字列 / 数値) は要素 1 の集合
// - 配列 (role_codes: number[] 等) は各要素を文字列化した集合 (server の配列フィルタ相当)
// FilterDef の `value` (string) は option の value と一致するので、id 列は行に
// その id を載せておけば `String(id)` で突合できる。
function rowFilterValues<TRow>(row: TRow, key: string): string[] {
  const value = (row as Record<string, unknown>)[key]
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map((v) => String(v))
  return [String(value)]
}

export function ClientDataTable<TRow>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectable = false,
  onSelectionChange,
  selectedKeys,
  onToggleRowKey,
  onToggleAllKeys,
  isRowSelectable,
  emptyMessage,
  emptyFilteredMessage,
  className,
  flush,
  tableClassName,
  rowClassName,
  bordered,
  striped,
  variant,
  showSearch = true,
  searchPlaceholder = 'キーワードで検索',
  showPagination = true,
  pageSize: defaultPageSize = 100,
  queryState,
  visibleColumns,
  onColumnsChange,
  actions,
  onCreate,
  createLabel,
  createHref,
  onReset,
  filters,
  collapsible,
  defaultCollapsed,
  disableColumnPicker = false,
  columnStorageKey,
  rowActions,
  animated,
  animationVariant,
  loading,
  toolbar = 'internal',
}: ClientDataTableProps<TRow>) {
  // queryState を渡されたら fully controlled (URL 駆動)。未指定なら内部 useState で
  // 従来どおり uncontrolled。setter は updater 関数形 (prev => next) も受けられるよう
  // ラップし、controlled 時は現在値に対して updater を解決して onChange に渡す。
  const [internalSortItems, setInternalSortItems] = useState<ServerSortItem[]>([])
  const [internalFilterText, setInternalFilterText] = useState('')
  const [internalPage, setInternalPage] = useState(0)
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize)

  const controlledQuery = queryState != null
  const sortItems = controlledQuery ? queryState.sortItems : internalSortItems
  const filterText = controlledQuery ? queryState.search : internalFilterText
  const page = controlledQuery ? queryState.page : internalPage
  const pageSize = controlledQuery ? queryState.pageSize : internalPageSize

  const setSortItems = (next: SetState<ServerSortItem[]>) => {
    if (controlledQuery) {
      const resolved = resolveUpdater(next, queryState.sortItems)
      // sort-prune effect は変化なしのとき同一参照を返す。無駄な URL 書き込みを避ける。
      if (resolved !== queryState.sortItems) queryState.onSortItemsChange(resolved)
    } else setInternalSortItems(next)
  }
  const setFilterText = (next: string) => {
    if (controlledQuery) queryState.onSearchChange(next)
    else setInternalFilterText(next)
  }
  const setPage = (next: SetState<number>) => {
    if (controlledQuery) {
      const resolved = resolveUpdater(next, queryState.page)
      if (resolved !== queryState.page) queryState.onPageChange(resolved)
    } else setInternalPage(next)
  }
  const setPageSize = (next: number) => {
    if (controlledQuery) queryState.onPageSizeChange(next)
    else setInternalPageSize(next)
  }

  // rowActions が渡された場合、列末尾に操作列 (hideable:false) を自動追加する。
  // ColumnPicker はこの effectiveColumns を受け取り、操作列を「常に表示(ロック)」行として出す。
  // localStorage キー / 表示状態の計算は元の columns ベース (操作列は含めない)。
  const effectiveColumns: Column<TRow>[] = useMemo(() => {
    if (!rowActions || rowActions.length === 0) return columns
    const width = rowActions.length * 34 + 10
    const actionsCol: Column<TRow> = {
      key: ROW_ACTIONS_KEY,
      label: '操作',
      align: 'right',
      width,
      hideable: false,
      render: (row) => <RowActionsCell row={row} actions={rowActions} />,
    }
    return [...columns, actionsCol]
  }, [columns, rowActions])

  const hasRowActions = (rowActions?.length ?? 0) > 0

  // 行クリックの既定操作: 明示 onRowClick > rowActions の default アクション。
  const effectiveOnRowClick = useMemo(
    () => onRowClick ?? resolveDefaultRowActionHandler(rowActions),
    [onRowClick, rowActions],
  )

  // uncontrolled モード時は localStorage で表示列を自管理する (既定 ON)。
  // controlled (onColumnsChange あり) のときは呼び出し側の値を優先する。
  // storage key / 既定は元の columns ベース。操作列キーは並べ替え位置を保存できるよう
  // known-set にだけ通す (storage key 署名は据え置き = 既存 pref を壊さない)。
  const internalVisibility = useColumnVisibilityState(
    columns,
    columnStorageKey,
    hasRowActions ? [ROW_ACTIONS_KEY] : undefined,
  )
  const controlled = onColumnsChange != null
  const effectiveVisibleColumns = controlled ? visibleColumns : internalVisibility.visibleColumns
  const pickerEnabled = !disableColumnPicker && columns.length > 1
  const effectiveOnColumnsChange = !pickerEnabled
    ? undefined
    : controlled
      ? onColumnsChange
      : internalVisibility.onColumnsChange

  // 表示対象 columns (visibleColumns / hideable / defaultHidden を共有ロジックで解決)
  // effectiveColumns を使うことで操作列 (__rowActions) も必ず含まれる
  const visibleColsResolved: Column<TRow>[] = useMemo(
    () => resolveVisibleColumns(effectiveColumns, effectiveVisibleColumns),
    [effectiveColumns, effectiveVisibleColumns],
  )
  // filter を列表示に連動させるための、表示中列 key 集合 (FilterDef.columnKey と突合)
  const visibleColumnKeys = useMemo(
    () => new Set(visibleColsResolved.map((c) => c.key)),
    [visibleColsResolved],
  )

  // 列を非表示にしたら、その列はソートからも外す (残りの順位が繰り上がり、データも
  // 組み替わる)。「見えない列で並び続ける」混乱と、順位バッジの抜け (①消えて②が浮く) を防ぐ。
  useEffect(() => {
    setSortItems((prev) => {
      const filtered = prev.filter((s) => visibleColumnKeys.has(s.columnKey))
      return filtered.length === prev.length ? prev : filtered
    })
  }, [visibleColumnKeys])

  // フィルタ (全文検索 + select フィルタの AND 合成)
  const filteredRows = useMemo(() => {
    let result = rows
    if (filterText) {
      const lower = filterText.toLowerCase()
      result = result.filter((row) =>
        visibleColsResolved.some((col) => cellTextValue(col, row).toLowerCase().includes(lower)),
      )
    }
    if (filters) {
      for (const f of filters) {
        if (f.multiple) {
          if (f.value.length === 0) continue
          // 複数選択: 行の値集合と選択値集合が 1 つでも交われば一致 (配列列にも対応)
          result = result.filter((row) => {
            const rowValues = rowFilterValues(row, f.key)
            return rowValues.some((v) => f.value.includes(v))
          })
        } else {
          if (f.value === null || f.value === undefined || f.value === '') continue
          // 単一選択: 行の値集合に選択値が含まれれば一致
          result = result.filter((row) => rowFilterValues(row, f.key).includes(f.value as string))
        }
      }
    }
    return result
  }, [rows, filterText, filters, visibleColsResolved])

  // ソート (sortItems の優先順で多列ソート。Column.sortable=true の列のみ有効)
  const sortedRows = useMemo(() => {
    if (sortItems.length === 0) return filteredRows
    const sorted = [...filteredRows]
    sorted.sort((a, b) => {
      for (const { columnKey, order } of sortItems) {
        const sortCol = visibleColsResolved.find((c) => c.key === columnKey)
        if (!sortCol) continue
        const av = cellTextValue(sortCol, a)
        const bv = cellTextValue(sortCol, b)
        const an = Number(av)
        const bn = Number(bv)
        let cmp: number
        if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== '' && bv !== '') {
          cmp = an - bn
        } else {
          cmp = av.localeCompare(bv, 'ja')
        }
        if (cmp !== 0) return order === 'asc' ? cmp : -cmp
      }
      return 0
    })
    return sorted
  }, [filteredRows, sortItems, visibleColsResolved])

  // ページネーション
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const safePageIndex = Math.min(page, totalPages - 1)
  const displayRows = showPagination
    ? sortedRows.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize)
    : sortedRows

  // フィルタ / ソート変更時にページをリセット。
  // 初回マウント時は実行しない: controlled (URL 駆動) で `?page=3` 等の deep-link を
  // 開いたとき、マウント直後の setPage(0) が page を 1 ページ目へ潰してしまうため
  // (uncontrolled は初期 page=0 なので無害だが、controlled 固有の退行になる)。
  const filterValuesKey = filters
    ? filters.map((f) => `${f.key}:${f.multiple ? f.value.join(',') : (f.value ?? '')}`).join('|')
    : ''
  const sortKey = sortItems.map((s) => `${s.columnKey}:${s.order}`).join(',')
  const prevResetKey = useRef<string | null>(null)
  useEffect(() => {
    const key = `${filterText}|${sortKey}|${filterValuesKey}`
    // 初回 (null) は基準を記録するだけ。実際に変化した 2 回目以降だけリセット。
    if (prevResetKey.current !== null && prevResetKey.current !== key) setPage(0)
    prevResetKey.current = key
  }, [filterText, sortKey, filterValuesKey])

  // この描画での行入れ替えがページ送り由来か (フィルタ/ソートは不変で page/pageSize だけ変化)
  // を判定する。ページ送りの退場行は「右スライド摘出」ではなく即時除去にしてノイズを消す。
  // ref は commit 後に更新するので、描画中は「前回コミット時の値」を読める。
  const filterSortKey = `${filterText}|${filterValuesKey}|${sortKey}`
  const prevPageSnapshot = useRef({ filterSortKey: '', page: 0, pageSize: defaultPageSize })
  const paginating =
    prevPageSnapshot.current.filterSortKey === filterSortKey &&
    (prevPageSnapshot.current.page !== safePageIndex ||
      prevPageSnapshot.current.pageSize !== pageSize)
  useEffect(() => {
    prevPageSnapshot.current = { filterSortKey, page: safePageIndex, pageSize }
  }, [filterSortKey, safePageIndex, pageSize])

  // selection は表示中ページの index ベースで管理 (key 選択モードでは使わないが hook は無条件に呼ぶ)
  const { selected, isAllSelected, toggleOne, toggleAll } = useSelection({
    totalRowCount: displayRows.length,
    onSelectionChange,
  })

  // key 選択モード: index ではなく getRowKey の安定キーで controlled 選択する。
  const keyMode = selectedKeys != null
  // 全選択の対象は「現フィルタ結果 (現ページではなく全ページ)」の選択可能行のキー。
  // sortedRows = filter + sort 済みの全件。displayRows (現ページ) ではない点が肝。
  const filteredSelectableKeys = useMemo(() => {
    if (!keyMode || !getRowKey) return []
    return sortedRows
      .filter((row) => isRowSelectable?.(row) ?? true)
      .map((row, i) => getRowKey(row, i))
  }, [keyMode, getRowKey, sortedRows, isRowSelectable])
  // runtime invariant: hook を全て呼んだ後に検査する (hook 順序を崩さない)。
  if (keyMode && !getRowKey) {
    // key 選択は getRowKey の戻り値で checked を判定するため、未指定だと選択が常に空になる。
    throw new Error('DataTable: selectedKeys を使う場合は getRowKey が必須です')
  }
  const keyAllSelected =
    keyMode &&
    filteredSelectableKeys.length > 0 &&
    filteredSelectableKeys.every((k) => selectedKeys.has(k))
  const handleToggleAllKeys = () => onToggleAllKeys?.(filteredSelectableKeys)

  const handleSortClick = (columnKey: string) => {
    setSortItems((prev) => {
      const existing = prev.find((s) => s.columnKey === columnKey)
      if (!existing) return [...prev, { columnKey, order: 'asc' as const }]
      if (existing.order === 'asc')
        return prev.map((s) => (s.columnKey === columnKey ? { ...s, order: 'desc' as const } : s))
      return prev.filter((s) => s.columnKey !== columnKey)
    })
  }

  const wrapperRef = useStickyToolbarOffset<HTMLDivElement>()

  if (columns.length === 0) return null

  const hasActiveFilter =
    filterText.length > 0 ||
    (filters?.some((f) => (f.multiple ? f.value.length > 0 : f.value !== null && f.value !== '')) ??
      false)
  // 選択件数: key モードは selectedKeys.size (ページ跨ぎの総数)、index モードは現ページの selected。
  // 表示件数は NumberTicker 付きの DataCountDisplay に集約 (絞り込み中は「M / N件」)。
  const selectedCount = keyMode ? (selectedKeys?.size ?? 0) : selected.size
  const rowCountLabel = (
    <DataCountDisplay
      totalCount={sortedRows.length}
      outOf={hasActiveFilter ? rows.length : undefined}
      selectedCount={selectedCount}
      loading={loading}
    />
  )

  // column picker (gear) はリセットの隣に出すため Toolbar に専用 prop で渡す。
  const columnPicker = effectiveOnColumnsChange ? (
    <ColumnPicker
      columns={effectiveColumns}
      visibleColumns={effectiveVisibleColumns}
      onColumnsChange={effectiveOnColumnsChange}
    />
  ) : undefined

  // client モードのリセットは内蔵検索値もクリアする (caller の onReset は外部フィルタ state 用)。
  // 列が uncontrolled (localStorage 駆動) のときは列状態も既定へ戻し、controlled (URL 駆動,
  // caller の onReset が cols= も消す) と挙動を揃える。
  const handleReset = onReset
    ? () => {
        setFilterText('')
        if (!controlled) internalVisibility.reset()
        onReset()
      }
    : undefined

  return (
    <div
      ref={wrapperRef}
      className={cn(styles.wrapper, flush && styles.wrapperFlush, className)}
      data-component="data-table"
      data-mode="client"
    >
      {toolbar === 'internal' &&
        (showSearch ||
          filters?.length ||
          columnPicker ||
          actions ||
          onCreate ||
          handleReset ||
          collapsible) && (
        <Toolbar
          search={
            showSearch
              ? { value: filterText, onChange: setFilterText, placeholder: searchPlaceholder }
              : undefined
          }
          filters={filters}
          visibleColumnKeys={visibleColumnKeys}
          rowCountLabel={rowCountLabel}
          columnPicker={columnPicker}
          actions={actions}
          onCreate={onCreate}
          createLabel={createLabel}
          createHref={createHref}
          onReset={handleReset}
          collapsible={collapsible}
          defaultCollapsed={defaultCollapsed}
        />
      )}

      <DataTableContent
        columns={visibleColsResolved}
        rows={displayRows}
        getRowKey={getRowKey}
        onRowClick={effectiveOnRowClick}
        selectable={selectable}
        selected={selectable && !keyMode ? selected : undefined}
        isAllSelected={keyMode ? keyAllSelected : isAllSelected}
        onToggleOne={keyMode ? undefined : toggleOne}
        onToggleAll={keyMode ? handleToggleAllKeys : toggleAll}
        selectedKeys={keyMode ? selectedKeys : undefined}
        onToggleRowKey={keyMode ? onToggleRowKey : undefined}
        isRowSelectable={keyMode ? isRowSelectable : undefined}
        tableClassName={tableClassName}
        rowClassName={rowClassName}
        emptyMessage={resolveEmptyMessage(hasActiveFilter, emptyMessage, emptyFilteredMessage)}
        bordered={bordered}
        striped={striped}
        variant={variant}
        sortableEnabled
        sortItems={sortItems}
        onSortClick={handleSortClick}
        animated={animated}
        animationVariant={animationVariant}
        paginating={paginating}
        loading={loading}
      />

      {showPagination && sortedRows.length > pageSize && (
        <div className={styles.pagination}>
          <Pagination
            currentPage={safePageIndex + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
          <select
            className={styles.pageSizeSelect}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
            aria-label="1 ページあたりの行数"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} 件
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
