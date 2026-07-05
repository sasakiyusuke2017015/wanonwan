'use client'

import { ClientDataTable } from './ClientDataTable'
import { ServerDataTable } from './ServerDataTable'
import type { DataTableProps } from './types'

/**
 * DataTable
 *
 * `mode` で `ClientDataTable` (内部 filter / sort / pagination / column picker) と
 * `ServerDataTable` (表示専用、外部から rows を 1:1 で渡す) に振り分ける薄い wrapper。
 * 詳細は packages/ui/core/organisms/DataTable/types.ts を参照。
 */
export function DataTable<TRow>(props: DataTableProps<TRow>) {
  if (props.mode === 'server') {
    return <ServerDataTable {...props} />
  }
  return <ClientDataTable {...props} />
}

export type {
  Column,
  ClientDataTableProps,
  ClientQueryState,
  ServerDataTableProps,
  DataTableProps,
  FilterOption,
  FilterDef,
  SearchDef,
  PaginationDef,
  ServerSortDef,
  ServerSortItem,
  ToolbarOptions,
  RowActionDef,
} from './types'
