'use client'

/**
 * VirtualizedTableBody - TanStack Virtualによる仮想化テーブルボディ
 *
 * InteractiveTableの enableVirtualization=true 時に使用される。
 * DOMには可視領域+overscan分の行のみをレンダリングし、
 * 1000件以上のデータでもスムーズにスクロールできる。
 *
 * enableColumnAnimation=true 時は motion.td + AnimatePresence を使用し、
 * 列ドラッグアニメーションと仮想スクロールを両立する。
 */
import { useRef, type FC, type CSSProperties, type ReactNode } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Checkbox } from '../../atoms/Checkbox';

import type {
  Column,
  TableRowData,
  CellColorTypes,
  CellBgType,
} from './types';
import styles from './InteractiveTable.module.scss';

interface VirtualizedTableBodyProps {
  data: TableRowData[];
  columns: Column[];
  // スクロールコンテナ（InteractiveTable の scrollContainerRef）
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  // 仮想化設定
  estimateRowHeight: number;
  overscan: number;
  // 選択機能
  enableSelection: boolean;
  selectedRows: number[];
  onSelectRow: (rowIndex: number, checked: boolean) => void;
  // セルイベント
  onCellClick: (rowIndex: number, colIndex: number, col: Column) => void;
  onCellMouseDown: (rowIndex: number, colIndex: number, e: React.MouseEvent) => void;
  onCellMouseEnter: (rowIndex: number, colIndex: number) => void;
  // 行イベント
  onRowHover?: (rowIndex: number | null) => void;
  onRowFocus?: (rowIndex: number | null) => void;
  // スタイル系ヘルパー（親からコールバックとして受け取る）
  getRowClassName: (rowIndex: number) => string;
  getColumnProportion: (col: Column) => string | number;
  getCellStyle: (row: TableRowData) => CSSProperties;
  getCellColorTypes: (rowIndex: number, colIndex: number, row: TableRowData) => CellColorTypes;
  getCellColorStyle: (colorTypes: CellColorTypes) => CSSProperties;
  getCellSelectionStyle: (row: number, col: number, isFirstCol: boolean) => CSSProperties;
  getMarchingAntsClass: (row: number, col: number) => string;
  renderCellContent: (col: Column, row: TableRowData, rowIndex: number, colIndex: number) => ReactNode;
  // その他
  enableRowHighlight: boolean;
  cellClassName?: (rowIndex: number, colIndex: number, column: Column, row: TableRowData) => string;
  tableRefs: React.MutableRefObject<(HTMLElement | null)[][]>;
  // 列アニメーション
  enableColumnAnimation?: boolean;
  draggingColumn?: string | null;
}

const VirtualizedTableBody: FC<VirtualizedTableBodyProps> = ({
  data,
  columns,
  scrollContainerRef,
  estimateRowHeight,
  overscan,
  enableSelection,
  selectedRows,
  onSelectRow,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  onRowHover,
  onRowFocus,
  getRowClassName,
  getColumnProportion,
  getCellStyle,
  getCellColorTypes,
  getCellColorStyle,
  getCellSelectionStyle,
  getMarchingAntsClass,
  renderCellContent,
  enableRowHighlight,
  cellClassName,
  tableRefs,
  enableColumnAnimation = false,
  draggingColumn = null,
}) => {
  const measureRef = useRef<Map<number, HTMLTableRowElement>>(new Map());

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
    measureElement: (element) => {
      return element.getBoundingClientRect().height;
    },
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  if (virtualItems.length === 0) {
    return (
      <tbody className={styles.tbody}>
        <tr>
          <td
            colSpan={columns.length + (enableSelection ? 1 : 0)}
            style={{ height: `${totalSize}px` }}
          />
        </tr>
      </tbody>
    );
  }

  const firstItemOffset = virtualItems[0].start;
  const lastItemEnd = virtualItems[virtualItems.length - 1].end;

  /** セルを描画（通常td / motion.td を分岐） */
  const renderCell = (
    col: Column,
    colIndex: number,
    row: TableRowData,
    rowIndex: number,
  ) => {
    const originalCellStyles = getCellStyle(row);
    const customCellClass = cellClassName
      ? cellClassName(rowIndex, colIndex, col, row)
      : '';

    const cellColorTypes = getCellColorTypes(rowIndex, colIndex, row);
    const cellColorStyle = getCellColorStyle(cellColorTypes);
    const isFirstCol = !enableSelection && colIndex === 0;
    const cellSelectionStyle = getCellSelectionStyle(rowIndex, colIndex, isFirstCol);

    const hoverBg: CellBgType = cellColorTypes.cellBg;
    const marchingAntsClass = getMarchingAntsClass(rowIndex, colIndex);
    const isDragging = enableColumnAnimation && draggingColumn === col.accessor;

    const mergedStyle: CSSProperties = {
      ...originalCellStyles,
      width: getColumnProportion(col),
      ...cellColorStyle,
      ...cellSelectionStyle,
    };

    const classList: string[] = [styles.cell];

    if (hoverBg === 'default' && enableRowHighlight) {
      classList.push(styles['cell--hoverHighlight']);
    }

    classList.push(col.dataFontSize ?? 'text-fluid-sm');

    // whiteSpace
    if (col.whiteSpace === 'nowrap') classList.push(styles['cell--nowrap']);
    else if (col.whiteSpace === 'pre') classList.push(styles['cell--pre']);
    else if (col.whiteSpace === 'pre-wrap') classList.push(styles['cell--preWrap']);
    else classList.push(styles['cell--normal']);

    // alignment
    if (col.dataAlign === 'left') {
      classList.push(styles['cell--left']);
    } else if (col.dataAlign === 'right') {
      classList.push(styles['cell--right']);
    } else if (/text-(left|right|center)/.test(customCellClass)) {
      classList.push(customCellClass);
    } else {
      if (customCellClass) classList.push(customCellClass);
      classList.push(styles['cell--center']);
    }

    if (isDragging) classList.push(styles['cell--dragging']);
    if (marchingAntsClass) classList.push(marchingAntsClass);

    const classes = classList.filter(Boolean).join(' ');

    if (enableColumnAnimation) {
      return (
        <motion.td
          key={col.accessor}
          ref={(el: HTMLTableCellElement | null) => {
            tableRefs.current[rowIndex] ||= [];
            tableRefs.current[rowIndex][colIndex] = el;
          }}
          layoutId={`cell-${rowIndex}-${col.accessor}`}
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'tween', duration: 0.1, ease: 'easeOut' }}
          className={classes}
          style={{
            ...mergedStyle,
            scale: isDragging ? 1.02 : 1,
            transformOrigin: 'left center',
          }}
          onClick={() => onCellClick(rowIndex, colIndex, col)}
          onMouseDown={(e: React.MouseEvent) => onCellMouseDown(rowIndex, colIndex, e)}
          onMouseEnter={() => onCellMouseEnter(rowIndex, colIndex)}
        >
          {renderCellContent(col, row, rowIndex, colIndex)}
        </motion.td>
      );
    }

    return (
      <td
        key={colIndex}
        ref={(el) => {
          tableRefs.current[rowIndex] ||= [];
          tableRefs.current[rowIndex][colIndex] = el;
        }}
        className={classes}
        style={mergedStyle}
        onClick={() => onCellClick(rowIndex, colIndex, col)}
        onMouseDown={(e) => onCellMouseDown(rowIndex, colIndex, e)}
        onMouseEnter={() => onCellMouseEnter(rowIndex, colIndex)}
      >
        {renderCellContent(col, row, rowIndex, colIndex)}
      </td>
    );
  };

  return (
    <tbody className={styles.tbody}>
      {/* 上部スペーサー */}
      {firstItemOffset > 0 && (
        <tr aria-hidden="true">
          <td
            colSpan={columns.length + (enableSelection ? 1 : 0)}
            className={styles.spacerCell}
            style={{ height: `${firstItemOffset}px` }}
          />
        </tr>
      )}

      {/* 仮想化された行 */}
      {virtualItems.map((virtualRow) => {
        const rowIndex = virtualRow.index;
        const row = data[rowIndex];
        const isSelected = selectedRows.includes(rowIndex);

        const rowClasses = [
          getRowClassName(rowIndex),
          styles.row,
          rowIndex === 0 ? styles['row--noBorderTop'] : '',
        ].filter(Boolean).join(' ');

        return (
          <tr
            key={rowIndex}
            ref={(el) => {
              if (el) {
                measureRef.current.set(rowIndex, el);
                rowVirtualizer.measureElement(el);
              } else {
                measureRef.current.delete(rowIndex);
              }
            }}
            data-index={virtualRow.index}
            className={rowClasses}
            onMouseEnter={() => onRowHover?.(rowIndex)}
            onMouseLeave={() => onRowHover?.(null)}
            onClick={() => onRowFocus?.(rowIndex)}
          >
            {/* 選択用checkbox列 */}
            {enableSelection && (
              <td
                className={styles.tdCheckbox}
                style={{
                  ...getCellSelectionStyle(rowIndex, -1, true),
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.checkboxCenter}>
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => onSelectRow(rowIndex, e.target.checked)}
                    size="medium"
                  />
                </div>
              </td>
            )}

            {/* データセル */}
            {enableColumnAnimation ? (
              <AnimatePresence mode="popLayout">
                {columns.map((col, colIndex) => renderCell(col, colIndex, row, rowIndex))}
              </AnimatePresence>
            ) : (
              columns.map((col, colIndex) => renderCell(col, colIndex, row, rowIndex))
            )}
          </tr>
        );
      })}

      {/* 下部スペーサー */}
      {lastItemEnd < totalSize && (
        <tr aria-hidden="true">
          <td
            colSpan={columns.length + (enableSelection ? 1 : 0)}
            className={styles.spacerCell}
            style={{ height: `${totalSize - lastItemEnd}px` }}
          />
        </tr>
      )}
    </tbody>
  );
};

export default VirtualizedTableBody;
