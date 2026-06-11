'use client'

/**
 * InteractiveTable - インタラクティブテーブルコンポーネント
 *
 * state管理・hooks結合・JSX組み立てを担当。
 * 各機能は専用hookに分離済み:
 *   useCellStyles       - セル色・ボーダー・マーチングアンツ計算
 *   useColumnResize     - 列リサイズロジック
 *   useCellSelection    - セル選択・ドラッグ・自動スクロール
 *   useKeyboardNavigation - キーボードナビゲーション
 *   renderCellContent   - セルコンテンツ描画
 *   VirtualizedTableBody - 仮想化テーブルボディ
 */
import { useState, useRef, useCallback, useEffect, useMemo, type FC } from 'react';

import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';

import { Checkbox } from '../../atoms/Checkbox';
import { LoadingZone } from '../../organisms/LoadingZone/LoadingZone';
import { getConditionalAnimationStyle, ANIMATIONS } from '../../constants';

import type {
  Column,
  CellBgType,
  TableRowData,
  InteractiveTableProps,
} from './types';
import VirtualizedTableBody from './VirtualizedTableBody';
import { useCellStyles } from './useCellStyles';
import { useColumnResize } from './useColumnResize';
import { useCellSelection } from './useCellSelection';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { createRenderCellContent } from './renderCellContent';
import styles from './InteractiveTable.module.scss';

export const InteractiveTable: FC<InteractiveTableProps> = ({
  columns = [],
  data = [],
  onCellClick,
  focusedRow,
  setFocusedRow,
  focusedCell,
  setFocusedCell,
  tableClassName = '',
  rowClassName,
  cellClassName,
  headerClassName = '',
  enableRowHighlight = true,
  enableRowColors = true,
  colorField = null,
  colorMap = {},
  highlightField = null,
  highlightColor = 'text-blue-500',
  loading = false,
  loadingHeight = '360px',
  loadingMessage = 'データを読み込み中...',
  onRowHover,
  onRowFocus,
  onLinkClick,
  onInternalLinkClick,
  enableKeyboardNavigation = false,
  onKeyboardNavigation,
  heightPercent = 60,
  heightOffset = 0,
  heightOffsetCss,
  enableSelection = false,
  selectedRows,
  onSelectionChange,
  enableCellSelection = false,
  selectedCells,
  onCellSelectionChange,
  enableColumnAnimation = false,
  draggingColumn = null,
  columnWidthsResetKey = 0,
  enableRowAnimation = true,
  rowAnimationVariant = 'slideDown',
  borderRadius = '4px',
  headerBgColor,
  headerTextColor,
  backgroundHeaderBgColor,
  tableHeaderBgColor = '#64748b',
  tableHeaderTextColor = '#ffffff',
  enableVirtualization = false,
  virtualRowHeight = 48,
  virtualOverscan = 10,
}) => {
  // アニメーション設定
  const rowAnimationConfig = ANIMATIONS.tableRow[rowAnimationVariant as keyof typeof ANIMATIONS.tableRow];

  // テーマカラーから背景色・文字色を導出
  const resolvedHeaderBgColor = headerBgColor ?? tableHeaderBgColor;
  const resolvedHeaderTextColor = headerTextColor ?? tableHeaderTextColor;
  const resolvedBackgroundHeaderBgColor = backgroundHeaderBgColor ?? resolvedHeaderBgColor;

  // refs
  const tableRefs = useRef<(HTMLElement | null)[][]>([]);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // ヘッダー高さ同期用
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const mainHeaderRef = useCallback((node: HTMLTableSectionElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (node) {
      setHeaderHeight(node.offsetHeight);
      resizeObserverRef.current = new ResizeObserver(() => {
        setHeaderHeight(node.offsetHeight);
      });
      resizeObserverRef.current.observe(node);
    }
  }, []);

  // 動的な高さを管理
  const [dynamicHeight, setDynamicHeight] = useState<number>(0);

  useEffect(() => {
    if (heightOffsetCss) return;

    const updateHeight = () => {
      const availableHeight = window.innerHeight;
      const calculatedHeight =
        (availableHeight - heightOffset) * (heightPercent / 100);
      setDynamicHeight(calculatedHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [heightPercent, heightOffset, heightOffsetCss]);

  // --- Hooks ---

  // 列リサイズ
  const {
    handleResizeStart,
    getColumnProportion,
  } = useColumnResize({
    columns,
    enableSelection,
    columnWidthsResetKey,
  });

  // セル選択
  const {
    selectionStart,
    setSelectionStart,
    selectionEnd,
    setSelectionEnd,
    copiedRange,
    setCopiedRange,
    activeRange,
    actualFocusedRow,
    actualSetFocusedRow,
    actualFocusedCell,
    actualSetFocusedCell,
    actualSelectedRows,
    actualSetSelectedRows,
    handleSelectAll,
    handleSelectRow,
    handleCellMouseDown,
    handleCellMouseEnter,
    getSelectedRowIndices,
    skipNextScrollRef,
  } = useCellSelection({
    data,
    enableCellSelection,
    enableKeyboardNavigation,
    focusedRow,
    setFocusedRow,
    focusedCell,
    setFocusedCell,
    selectedRows,
    onSelectionChange,
    selectedCells,
    onCellSelectionChange,
    tableContainerRef,
    scrollContainerRef,
    tableRefs,
  });

  // セルスタイル
  const {
    getCellBorderStyle,
    getCellSelectionStyle,
    getMarchingAntsClass,
    getCellColorTypes,
    getCellColorStyle,
    getRowClassName,
    getCellStyle,
  } = useCellStyles({
    activeRange,
    copiedRange,
    selectionStart,
    borderRadius,
    rowClassName,
    data,
    enableRowColors,
    colorField,
    colorMap,
    highlightField,
    highlightColor,
  });

  // キーボードナビゲーション
  const {
    handleKeyDown,
    handleCellClick,
  } = useKeyboardNavigation({
    data,
    columns,
    enableKeyboardNavigation,
    enableCellSelection,
    enableSelection,
    selectionStart,
    setSelectionStart,
    selectionEnd,
    setSelectionEnd,
    copiedRange,
    setCopiedRange,
    activeRange,
    actualFocusedRow,
    actualSetFocusedRow,
    actualFocusedCell,
    actualSetFocusedCell,
    actualSelectedRows,
    actualSetSelectedRows,
    getSelectedRowIndices,
    skipNextScrollRef,
    tableContainerRef,
    tableRefs,
    onCellClick,
    onKeyboardNavigation,
    onLinkClick,
    onInternalLinkClick,
  });

  // セルコンテンツ描画関数
  const renderCellContent = useMemo(
    () => createRenderCellContent({
      actualFocusedCell,
      onLinkClick,
      onInternalLinkClick,
    }),
    [actualFocusedCell, onLinkClick, onInternalLinkClick]
  );

  // --- 高さ計算 ---
  const cssHeight = heightOffsetCss
    ? `calc((100vh - (${heightOffsetCss})) * ${heightPercent / 100})`
    : undefined;
  const jsHeight = dynamicHeight > 0 ? `${dynamicHeight}px` : `${heightPercent}vh`;
  const resolvedHeight = cssHeight ?? jsHeight;

  const containerStyle: React.CSSProperties = {
    height: resolvedHeight,
    maxHeight: resolvedHeight,
    minHeight: resolvedHeight,
    flexShrink: 0,
    boxSizing: 'border-box',
    position: 'relative',
    borderTopLeftRadius: borderRadius,
  };

  // --- ヘッダー描画ヘルパー ---
  const renderCheckboxHeader = () => {
    if (!enableSelection) return null;
    return (
      <th
        className={styles.thCheckbox}
        style={{
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          backgroundColor: resolvedHeaderBgColor,
          color: resolvedHeaderTextColor,
        }}
      >
        <div className={styles.checkboxCenter}>
          <Checkbox
            checked={actualSelectedRows.length === data.length && data.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            size="medium"
          />
        </div>
      </th>
    );
  };

  // --- VirtualizedTableBody の共通props ---
  const virtualizedBodyProps = {
    data,
    columns,
    scrollContainerRef,
    estimateRowHeight: virtualRowHeight,
    overscan: virtualOverscan,
    enableSelection,
    selectedRows: actualSelectedRows,
    onSelectRow: handleSelectRow,
    onCellClick: handleCellClick,
    onCellMouseDown: handleCellMouseDown,
    onCellMouseEnter: handleCellMouseEnter,
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
  };

  // --- セル class 構築ヘルパー ---
  const buildCellClasses = (col: Column, colIndex: number, row: TableRowData, rowIndex: number) => {
    const customCellClass = cellClassName
      ? cellClassName(rowIndex, colIndex, col, row)
      : '';

    const cellColorTypes = getCellColorTypes(rowIndex, colIndex, row);
    const hoverBg: CellBgType = cellColorTypes.cellBg;

    const marchingAntsClass = getMarchingAntsClass(rowIndex, colIndex);

    const classList: string[] = [styles.cell];

    if (hoverBg === 'default' && enableRowHighlight) {
      classList.push(styles['cell--hoverHighlight']);
    }

    // whiteSpace
    if (col.whiteSpace === 'nowrap') classList.push(styles['cell--nowrap']);
    else if (col.whiteSpace === 'pre') classList.push(styles['cell--pre']);
    else if (col.whiteSpace === 'pre-wrap') classList.push(styles['cell--preWrap']);
    else classList.push(styles['cell--normal']);

    // font size - keep as className since these are Tailwind fluid classes
    classList.push(col.dataFontSize ?? 'text-fluid-sm');

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

    if (marchingAntsClass) classList.push(marchingAntsClass);

    return classList.filter(Boolean).join(' ');
  };

  // --- 通常tbody描画ヘルパー ---
  const renderNormalTbody = (useMotion: boolean) => (
    <tbody className={styles.tbody}>
      {data.map((row, rowIndex) => {
        const isSelected = actualSelectedRows.includes(rowIndex);
        const rowClasses = [
          getRowClassName(rowIndex),
          styles.row,
          rowIndex === 0 ? styles['row--noBorderTop'] : '',
        ].filter(Boolean).join(' ');

        return (
          <tr
            key={enableRowAnimation ? `row-${rowIndex}-${data.length}` : rowIndex}
            className={rowClasses}
            style={getConditionalAnimationStyle(enableRowAnimation, rowAnimationConfig, rowIndex)}
            onMouseEnter={() => onRowHover?.(rowIndex)}
            onMouseLeave={() => onRowHover?.(null)}
            onClick={() => onRowFocus?.(rowIndex)}
          >
            {enableSelection && (
              <td
                className={styles.tdCheckbox}
                style={{
                  ...getCellBorderStyle({ top: 'normal', bottom: 'normal', left: 'normal', right: 'normal' }, rowIndex, true)
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.checkboxCenter}>
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                    size="medium"
                  />
                </div>
              </td>
            )}
            {useMotion ? (
              <AnimatePresence mode="popLayout">
                {columns.map((col, colIndex) => renderMotionCell(col, colIndex, row, rowIndex))}
              </AnimatePresence>
            ) : (
              columns.map((col, colIndex) => renderNormalCell(col, colIndex, row, rowIndex))
            )}
          </tr>
        );
      })}
    </tbody>
  );

  // --- セル描画ヘルパー ---
  const renderCellCommon = (col: Column, colIndex: number, row: TableRowData, rowIndex: number) => {
    const originalCellStyles = getCellStyle(row);

    const cellColorTypes = getCellColorTypes(rowIndex, colIndex, row);
    const cellColorStyle = getCellColorStyle(cellColorTypes);
    const isFirstCol = !enableSelection && colIndex === 0;
    const cellSelectionStyle = getCellSelectionStyle(rowIndex, colIndex, isFirstCol);

    const mergedStyle: React.CSSProperties = {
      ...originalCellStyles,
      width: getColumnProportion(col),
      ...cellColorStyle,
      ...cellSelectionStyle,
    };

    const classes = buildCellClasses(col, colIndex, row, rowIndex);

    return { mergedStyle, classes };
  };

  const renderMotionCell = (col: Column, colIndex: number, row: TableRowData, rowIndex: number) => {
    const { mergedStyle, classes } = renderCellCommon(col, colIndex, row, rowIndex);
    const isDragging = draggingColumn === col.accessor;

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
        className={[classes, isDragging ? styles['cell--dragging'] : ''].filter(Boolean).join(' ')}
        style={{
          ...mergedStyle,
          scale: isDragging ? 1.02 : 1,
          transformOrigin: 'left center',
        }}
        onClick={() => handleCellClick(rowIndex, colIndex, col)}
        onMouseDown={(e: React.MouseEvent) => handleCellMouseDown(rowIndex, colIndex, e)}
        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
      >
        {renderCellContent(col, row, rowIndex, colIndex)}
      </motion.td>
    );
  };

  const renderNormalCell = (col: Column, colIndex: number, row: TableRowData, rowIndex: number) => {
    const { mergedStyle, classes } = renderCellCommon(col, colIndex, row, rowIndex);

    return (
      <td
        key={colIndex}
        ref={(el) => {
          tableRefs.current[rowIndex] ||= [];
          tableRefs.current[rowIndex][colIndex] = el;
        }}
        className={classes}
        style={mergedStyle}
        onClick={() => handleCellClick(rowIndex, colIndex, col)}
        onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
      >
        {renderCellContent(col, row, rowIndex, colIndex)}
      </td>
    );
  };

  // --- ヘッダーTH class 構築 ---
  const buildThClasses = (col: Column, isDragging?: boolean) => {
    const classList: string[] = [styles.th];
    if (col.headAlign === 'center') classList.push(styles['th--center']);
    else if (col.headAlign === 'right') classList.push(styles['th--right']);
    else classList.push(styles['th--left']);
    classList.push(col.headFontSize ?? 'text-fluid-xs');
    if (isDragging) classList.push(styles['th--dragging']);
    return classList.filter(Boolean).join(' ');
  };

  // --- JSX ---
  return (
    <LoadingZone
      loading={loading}
      variant="table"
      height={loadingHeight}
      message={loadingMessage}
      className="rounded-lg"
      accentTextColor={resolvedHeaderTextColor}
      primaryBgColor={resolvedHeaderBgColor}
    >
      <div
        ref={tableContainerRef}
        className={[
          styles.container,
          enableKeyboardNavigation ? styles['container--focusable'] : '',
        ].filter(Boolean).join(' ')}
        style={containerStyle}
        tabIndex={enableKeyboardNavigation ? 0 : undefined}
        onKeyDown={enableKeyboardNavigation ? handleKeyDown : undefined}
        role={enableKeyboardNavigation ? 'region' : undefined}
        aria-label={
          enableKeyboardNavigation ? 'Interactive table container' : undefined
        }
        data-component="interactive-table"
      >
        <div
          className={styles.innerWrapper}
          style={{ borderRadius }}
        >
          <div ref={scrollContainerRef} className={styles.scrollContainer}>
            {/* ヘッダー裏の背景（角丸の下の隙間を埋める） */}
            {headerHeight > 0 && (
              <div
                className={styles.headerBackground}
                style={{
                  borderRadius,
                  backgroundColor: resolvedBackgroundHeaderBgColor,
                  marginBottom: `-${headerHeight}px`,
                  height: `${headerHeight}px`,
                }}
                aria-hidden="true"
              />
            )}

            {enableColumnAnimation ? (
              <LayoutGroup>
                <table
                  className={[styles.table, tableClassName].filter(Boolean).join(' ')}
                >
                  <thead
                    ref={mainHeaderRef}
                    className={[styles.thead, headerClassName].filter(Boolean).join(' ')}
                    style={{ borderRadius, color: resolvedHeaderTextColor }}
                  >
                    <tr>
                      {renderCheckboxHeader()}
                      <AnimatePresence mode="popLayout">
                        {columns.map((col, idx) => {
                          const isDragging = draggingColumn === col.accessor;
                          return (
                            <motion.th
                              key={col.accessor}
                              layoutId={`header-${col.accessor}`}
                              layout="position"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ type: 'tween', duration: 0.1, ease: 'easeOut' }}
                              className={buildThClasses(col, isDragging)}
                              style={{
                                width: getColumnProportion(col),
                                scale: isDragging ? 1.02 : 1,
                                transformOrigin: 'left center',
                                borderBottomLeftRadius: borderRadius,
                                borderBottomRightRadius: borderRadius,
                                backgroundColor: resolvedHeaderBgColor,
                                color: resolvedHeaderTextColor,
                              }}
                            >
                              {col.label}
                              {idx < columns.length - 1 && (
                                <div
                                  className={styles.resizeHandle}
                                  onMouseDown={(e) => handleResizeStart(e, idx)}
                                  title="列幅を調整"
                                />
                              )}
                            </motion.th>
                          );
                        })}
                      </AnimatePresence>
                    </tr>
                  </thead>
                  {enableVirtualization ? (
                    <VirtualizedTableBody
                      {...virtualizedBodyProps}
                      enableColumnAnimation={true}
                      draggingColumn={draggingColumn}
                    />
                  ) : (
                    renderNormalTbody(true)
                  )}
                </table>
              </LayoutGroup>
            ) : (
              <table
                className={[styles.table, tableClassName].filter(Boolean).join(' ')}
              >
                <thead
                  ref={mainHeaderRef}
                  className={[styles.thead, headerClassName].filter(Boolean).join(' ')}
                  style={{ borderRadius, color: resolvedHeaderTextColor }}
                >
                  <tr>
                    {renderCheckboxHeader()}
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className={buildThClasses(col)}
                        style={{
                          width: getColumnProportion(col),
                          borderBottomLeftRadius: borderRadius,
                          borderBottomRightRadius: borderRadius,
                          backgroundColor: resolvedHeaderBgColor,
                          color: resolvedHeaderTextColor,
                        }}
                      >
                        {col.label}
                        {idx < columns.length - 1 && (
                          <div
                            className={styles.resizeHandle}
                            onMouseDown={(e) => handleResizeStart(e, idx)}
                            title="列幅を調整"
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                {enableVirtualization ? (
                  <VirtualizedTableBody {...virtualizedBodyProps} />
                ) : (
                  renderNormalTbody(false)
                )}
              </table>
            )}
          </div>
        </div>
      </div>
    </LoadingZone>
  );
};

