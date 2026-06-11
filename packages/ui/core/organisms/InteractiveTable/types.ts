/**
 * InteractiveTable 型定義
 */
import type React from 'react';
import type { TableRowAnimationVariant } from '../../constants';

export interface Column {
  label: string;
  accessor: string;
  proportion?: string | number;
  cellType?: 'text' | 'link' | 'internal';
  headAlign?: 'left' | 'center' | 'right';
  dataAlign?: 'left' | 'center' | 'right';
  headFontSize?: 'text-fluid-xs' | 'text-fluid-sm' | 'text-fluid-base' | 'text-fluid-lg' | 'text-fluid-xl';
  dataFontSize?: 'text-fluid-xs' | 'text-fluid-sm' | 'text-fluid-base' | 'text-fluid-lg' | 'text-fluid-xl';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap';
  render?: (value: unknown, row: TableRowData, rowIndex: number) => React.ReactNode;
}

export interface FocusedCell {
  row: number;
  col: number;
}

export interface SelectedCell {
  row: number;
  col: number; // -1 = checkbox column
}

// アクティブな範囲選択の境界
export interface ActiveRange {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

// 罫線タイプ
// normal: 通常のグレーボーダー
// active: 選択範囲の外周（緑）- 隣接セルのボーダーも含めて4px表示
// copied: コピー範囲の外周（青点線）- 隣接セルのボーダーも含めて4px表示
export type BorderType = 'normal' | 'active' | 'copied';

// セルの各辺の罫線タイプ
export interface CellBorderTypes {
  top: BorderType;
  right: BorderType;
  bottom: BorderType;
  left: BorderType;
}

// セルの背景色タイプ
export type CellBgType = 'default' | 'selected' | 'focused';

// 行の背景色タイプ
export type RowBgType = 'stripe-even' | 'stripe-odd' | 'red' | 'green' | 'yellow';

// セルの色情報
export interface CellColorTypes {
  cellBg: CellBgType;
  rowBg: RowBgType;
}

export interface ColorStyle {
  backgroundColor?: string;
  color?: string;
  border?: string;
  fontWeight?: string;
  fontSize?: string;
}

export interface LinkData {
  text: string;
  url: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

export interface InternalLinkData {
  text: string;
  to: string;
  variant?: 'button' | 'text' | 'link';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export type TableRowData = Record<
  string,
  string | number | boolean | React.ReactNode | LinkData | InternalLinkData
>;

export interface InteractiveTableProps {
  columns?: Column[];
  data?: TableRowData[];
  searchColumn?: string | null;
  onCellClick?: (
    rowIndex: number,
    colIndex: number,
    column: Column,
    row: TableRowData
  ) => void;
  focusedRow?: number | null;
  setFocusedRow?: (row: number | null) => void;
  focusedCell?: FocusedCell | null;
  setFocusedCell?: (cell: FocusedCell | null) => void;
  tableClassName?: string;
  rowClassName?: (rowIndex: number, row: TableRowData) => string;
  cellClassName?: (
    rowIndex: number,
    colIndex: number,
    column: Column,
    row: TableRowData
  ) => string;
  headerClassName?: string;
  enableRowHighlight?: boolean;
  enableRowColors?: boolean;
  colorField?: string | null;
  colorMap?: Record<string, string | ColorStyle>;
  highlightField?: string | null;
  highlightColor?: string;
  loading?: boolean;
  loadingHeight?: string;
  loadingMessage?: string;
  onRowHover?: (rowIndex: number | null) => void;
  onRowFocus?: (rowIndex: number | null) => void;
  onLinkClick?: (
    linkData: LinkData,
    rowIndex: number,
    colIndex: number
  ) => void;
  onInternalLinkClick?: (
    linkData: InternalLinkData,
    rowIndex: number,
    colIndex: number
  ) => void;
  enableKeyboardNavigation?: boolean;
  onKeyboardNavigation?: (
    event: React.KeyboardEvent,
    focusedCell: { row: number; col: number } | null
  ) => void;
  heightPercent?: number;
  heightOffset?: number;
  /** CSSベースの高さオフセット（CSS変数やcalc()式を文字列で指定）。指定時は heightOffset より優先 */
  heightOffsetCss?: string;
  enableSelection?: boolean;
  selectedRows?: number[];
  onSelectionChange?: (selectedRows: number[]) => void;
  // セル選択機能
  enableCellSelection?: boolean;
  selectedCells?: SelectedCell[];
  onCellSelectionChange?: (selectedCells: SelectedCell[]) => void;
  enableColumnAnimation?: boolean;
  draggingColumn?: string | null;
  columnWidthsResetKey?: number;
  // アニメーション設定（Layoutから渡される）
  enableRowAnimation?: boolean;
  rowAnimationVariant?: TableRowAnimationVariant;
  // デザイン設定（上位のDesignTypeから渡される）
  borderRadius?: string;
  // テーマカラー - デフォルトの背景色・文字色を決定（現在は未使用）
  themeColor?: 'emerald' | 'slate' | 'indigo' | 'blue' | 'rose' | 'light';
  // ヘッダー背景色 - Layout から props で渡す
  headerBgColor?: string;
  // ヘッダーテキスト色 - Layout から props で渡す
  headerTextColor?: string;
  // 裏側ヘッダーの背景色（角丸の隙間を埋める用） - Layout から props で渡す
  backgroundHeaderBgColor?: string;
  // テーブルヘッダー背景色（デフォルト値用） - Layout から props で渡す
  tableHeaderBgColor?: string;
  // テーブルヘッダーテキスト色（デフォルト値用） - Layout から props で渡す
  tableHeaderTextColor?: string;
  // 仮想スクロール（TanStack Virtual）を有効にするか
  enableVirtualization?: boolean;
  // 仮想スクロール時の推定行高（px）
  virtualRowHeight?: number;
  // 仮想スクロール時のオーバースキャン行数
  virtualOverscan?: number;
}
