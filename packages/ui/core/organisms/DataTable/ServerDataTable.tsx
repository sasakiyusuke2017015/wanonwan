'use client'

import { Pagination } from '../../molecules/Pagination'
import { cn } from '../../utils/cn'

import { useEffect, useMemo } from 'react'

import { ColumnPicker } from './ColumnPicker'
import { resolveVisibleColumns } from './columnVisibility'
import { DataTableContent, resolveEmptyMessage } from './DataTableContent'
import { RowActionsCell, resolveDefaultRowActionHandler } from './RowActions'
import { Toolbar } from './Toolbar'
import { ROW_ACTIONS_KEY } from './types'
import type { Column, ServerDataTableProps } from './types'
import { useColumnVisibilityState } from './useColumnVisibilityState'
import { useSelection } from './useSelection'
import { useStickyToolbarOffset } from './useStickyToolbarOffset'
import styles from './DataTable.module.scss'

export function ServerDataTable<TRow>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectable = false,
  onSelectionChange,
  emptyMessage,
  emptyFilteredMessage,
  className,
  flush,
  tableClassName,
  rowClassName,
  bordered,
  striped,
  variant,
  search,
  filters,
  pagination,
  totalCount,
  actions,
  onCreate,
  createLabel,
  createHref,
  onReset,
  collapsible,
  defaultCollapsed,
  showSearch = true,
  showFilters = true,
  sort,
  visibleColumns,
  onColumnsChange,
  disableColumnPicker = false,
  columnStorageKey,
  rowActions,
  animated,
  animationVariant,
  loading,
}: ServerDataTableProps<TRow>) {
  const { selected, isAllSelected, toggleOne, toggleAll } = useSelection({
    totalRowCount: rows.length,
    onSelectionChange,
  })

  // rowActions が渡された場合、列末尾に操作列 (hideable:false) を自動追加する。
  // ColumnPicker はこの effectiveColumns を受け取り、操作列を「常に表示(ロック)」行として出す。
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

  const effectiveSearch = showSearch ? search : undefined
  const effectiveFilters = showFilters ? filters : undefined

  // 検索 or いずれかの filter に値が入っているか。空表示メッセージの出し分けに使う。
  const hasActiveFilter =
    (effectiveSearch?.value.length ?? 0) > 0 ||
    (effectiveFilters?.some((f) =>
      f.multiple ? f.value.length > 0 : f.value !== null && f.value !== '',
    ) ??
      false)

  // 表示対象 columns (visibleColumns / hideable / defaultHidden を共有ロジックで解決)
  const visibleCols = resolveVisibleColumns(effectiveColumns, effectiveVisibleColumns)
  // filter を列表示に連動させるための、表示中列 key 集合 (FilterDef.columnKey と突合)
  const visibleColumnKeys = useMemo(() => new Set(visibleCols.map((c) => c.key)), [visibleCols])

  // 列を非表示にしたら、その列を URL の sort からも外す (残りの順位が繰り上がり、データも
  // 組み替わる)。client モードの挙動と揃える。onSortItemsChange 未提供なら何もしない。
  const sortKeySig = sort ? sort.items.map((i) => i.columnKey).join(',') : ''
  useEffect(() => {
    if (!sort?.onSortItemsChange || sort.items.length === 0) return
    const filtered = sort.items.filter((i) => visibleColumnKeys.has(i.columnKey))
    if (filtered.length !== sort.items.length) sort.onSortItemsChange(filtered)
    // sortKeySig は sort.items の依存を文字列化したもの (配列の参照変化での無駄打ちを避ける)
  }, [visibleColumnKeys, sortKeySig])

  // column picker (gear) はリセットの隣に出すため Toolbar に専用 prop で渡す。
  const columnPicker = effectiveOnColumnsChange ? (
    <ColumnPicker
      columns={effectiveColumns}
      visibleColumns={effectiveVisibleColumns}
      onColumnsChange={effectiveOnColumnsChange}
    />
  ) : undefined

  // toolbar は検索 / フィルタ / 件数 / actions / reset / collapsible / 列ピッカーのいずれかが指定されたときだけ出す。
  // 絞り込みは行わず、現在値の表示と onChange の発火のみ (絞り込みは呼び出し側責務)。
  const showToolbar =
    effectiveSearch != null ||
    (effectiveFilters != null && effectiveFilters.length > 0) ||
    totalCount != null ||
    actions != null ||
    onCreate != null ||
    columnPicker != null ||
    onReset != null ||
    collapsible != null

  const wrapperRef = useStickyToolbarOffset<HTMLDivElement>()

  return (
    <div
      ref={wrapperRef}
      className={cn(styles.wrapper, flush && styles.wrapperFlush, className)}
      data-component="data-table"
      data-mode="server"
    >
      {showToolbar && (
        <Toolbar
          search={effectiveSearch}
          filters={effectiveFilters}
          visibleColumnKeys={visibleColumnKeys}
          rowCountLabel={totalCount != null ? `${totalCount} 件` : undefined}
          columnPicker={columnPicker}
          actions={actions}
          onCreate={onCreate}
          createLabel={createLabel}
          createHref={createHref}
          onReset={onReset}
          collapsible={collapsible}
          defaultCollapsed={defaultCollapsed}
        />
      )}

      <DataTableContent
        columns={visibleCols}
        rows={rows}
        getRowKey={getRowKey}
        onRowClick={effectiveOnRowClick}
        selectable={selectable}
        selected={selectable ? selected : undefined}
        isAllSelected={isAllSelected}
        onToggleOne={toggleOne}
        onToggleAll={toggleAll}
        tableClassName={tableClassName}
        rowClassName={rowClassName}
        emptyMessage={resolveEmptyMessage(hasActiveFilter, emptyMessage, emptyFilteredMessage)}
        bordered={bordered}
        striped={striped}
        variant={variant}
        sortableEnabled={sort != null}
        sortItems={sort?.items ?? []}
        onSortClick={sort?.onSortClick}
        animated={animated}
        animationVariant={animationVariant}
        loading={loading}
      />

      {pagination && (
        <div className={styles.pagination}>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  )
}
