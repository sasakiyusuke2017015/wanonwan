/**
 * useCellStyles - セルのスタイル計算ロジック
 *
 * セルの罫線タイプ・色・ボーダー・マーチングアンツの計算を担当。
 * 純粋な計算のみで副作用なし。
 */
import { useCallback, type CSSProperties } from 'react';

import type {
  ActiveRange,
  BorderType,
  CellBorderTypes,
  CellBgType,
  RowBgType,
  CellColorTypes,
  ColorStyle,
  SelectedCell,
  TableRowData,
} from './types';

interface UseCellStylesParams {
  activeRange: ActiveRange | null;
  copiedRange: ActiveRange | null;
  selectionStart: SelectedCell | null;
  borderRadius: string;
  // getRowClassName 用
  rowClassName?: (rowIndex: number, row: TableRowData) => string;
  data: TableRowData[];
  // getCellStyle 用
  enableRowColors: boolean;
  colorField: string | null;
  colorMap: Record<string, string | ColorStyle>;
  highlightField: string | null;
  highlightColor: string;
}

interface UseCellStylesReturn {
  getCellBorderTypes: (row: number, col: number) => CellBorderTypes;
  getCellBorderStyle: (borderTypes: CellBorderTypes, rowIndex: number, isFirstCol: boolean) => CSSProperties;
  getCellSelectionStyle: (row: number, col: number, isFirstCol?: boolean) => CSSProperties;
  getMarchingAntsClass: (row: number, col: number) => string;
  getCellColorTypes: (rowIndex: number, colIndex: number, rowData: TableRowData) => CellColorTypes;
  getCellColorStyle: (colorTypes: CellColorTypes) => CSSProperties;
  getRowClassName: (rowIndex: number) => string;
  getCellStyle: (row: Record<string, unknown>) => CSSProperties;
}

/**
 * 色をブレンドするユーティリティ関数
 * 簡易実装: オーバーレイ色を返す
 */
const blendColors = (_baseColor: string, overlayColor: string): string => {
  return overlayColor;
};

export const useCellStyles = ({
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
}: UseCellStylesParams): UseCellStylesReturn => {

  // セルの罫線タイプを取得
  const getCellBorderTypes = useCallback((row: number, col: number): CellBorderTypes => {
    let top: BorderType = 'normal';
    let bottom: BorderType = 'normal';
    let left: BorderType = 'normal';
    let right: BorderType = 'normal';

    const applyRangeBorder = (range: ActiveRange, borderType: 'active' | 'copied') => {
      const isInRange = row >= range.minRow && row <= range.maxRow &&
                        col >= range.minCol && col <= range.maxCol;

      if (isInRange) {
        if (row === range.minRow) top = borderType;
        if (row === range.maxRow) bottom = borderType;
        if (col === range.minCol) left = borderType;
        if (col === range.maxCol) right = borderType;
      } else {
        if (row === range.minRow - 1 && col >= range.minCol && col <= range.maxCol) {
          bottom = borderType;
        }
        if (row === range.maxRow + 1 && col >= range.minCol && col <= range.maxCol) {
          top = borderType;
        }
        if (col === range.minCol - 1 && row >= range.minRow && row <= range.maxRow) {
          right = borderType;
        }
        if (col === range.maxCol + 1 && row >= range.minRow && row <= range.maxRow) {
          left = borderType;
        }
      }
    };

    if (copiedRange) {
      applyRangeBorder(copiedRange, 'copied');
    }
    if (activeRange) {
      applyRangeBorder(activeRange, 'active');
    }

    return { top, bottom, left, right };
  }, [activeRange, copiedRange]);

  // 罫線タイプからスタイルを生成
  const getCellBorderStyle = useCallback((
    borderTypes: CellBorderTypes,
    rowIndex: number,
    isFirstCol: boolean
  ): CSSProperties => {
    const normalColor = '#d1d5db'; // gray-300
    const activeColor = '#16a34a'; // green-600

    const style: CSSProperties = {
      borderTopWidth: '2px',
      borderTopStyle: 'solid',
      borderTopColor: 'transparent',
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid',
      borderBottomColor: normalColor,
      borderLeftWidth: '2px',
      borderLeftStyle: 'solid',
      borderLeftColor: 'transparent',
      borderRightWidth: '2px',
      borderRightStyle: 'solid',
      borderRightColor: normalColor,
      borderRadius: borderRadius,
    };

    if (rowIndex === 0) {
      style.borderTopColor = normalColor;
    }
    if (isFirstCol) {
      style.borderLeftColor = normalColor;
    }

    // top
    if (borderTypes.top === 'active') {
      style.borderTopColor = activeColor;
    } else if (borderTypes.top === 'copied') {
      style.borderTopColor = 'transparent';
    }
    // bottom
    if (borderTypes.bottom === 'active') {
      style.borderBottomColor = activeColor;
    } else if (borderTypes.bottom === 'copied') {
      style.borderBottomColor = 'transparent';
    }
    // left
    if (borderTypes.left === 'active') {
      style.borderLeftColor = activeColor;
    } else if (borderTypes.left === 'copied') {
      style.borderLeftColor = 'transparent';
    }
    // right
    if (borderTypes.right === 'active') {
      style.borderRightColor = activeColor;
    } else if (borderTypes.right === 'copied') {
      style.borderRightColor = 'transparent';
    }

    return style;
  }, [borderRadius]);

  // セルのボーダースタイルを取得
  const getCellSelectionStyle = useCallback((
    row: number,
    col: number,
    isFirstCol: boolean = false
  ): CSSProperties => {
    const borderTypes = getCellBorderTypes(row, col);
    return getCellBorderStyle(borderTypes, row, isFirstCol);
  }, [getCellBorderTypes, getCellBorderStyle]);

  // マーチングアンツクラス名を取得
  const getMarchingAntsClass = useCallback((row: number, col: number): string => {
    if (!copiedRange) return '';

    const isInRange = row >= copiedRange.minRow && row <= copiedRange.maxRow &&
                      col >= copiedRange.minCol && col <= copiedRange.maxCol;
    if (!isInRange) return '';

    const classes: string[] = ['marching-ants'];
    if (row === copiedRange.minRow) classes.push('marching-ants-top');
    if (row === copiedRange.maxRow) classes.push('marching-ants-bottom');
    if (col === copiedRange.minCol) classes.push('marching-ants-left');
    if (col === copiedRange.maxCol) classes.push('marching-ants-right');

    return classes.join(' ');
  }, [copiedRange]);

  // セルの色タイプを取得
  const getCellColorTypes = useCallback((
    rowIndex: number,
    colIndex: number,
    rowData: TableRowData
  ): CellColorTypes => {
    const rowStyleType = rowData?.rowStyleType;
    let rowBg: RowBgType;
    if (rowStyleType === 'red') {
      rowBg = 'red';
    } else if (rowStyleType === 'green') {
      rowBg = 'green';
    } else if (rowStyleType === 'yellow') {
      rowBg = 'yellow';
    } else {
      rowBg = rowIndex % 2 === 0 ? 'stripe-even' : 'stripe-odd';
    }

    const isSelectionStartCell = selectionStart?.row === rowIndex && selectionStart?.col === colIndex;
    const isInSelection = activeRange !== null &&
      rowIndex >= activeRange.minRow && rowIndex <= activeRange.maxRow &&
      colIndex >= activeRange.minCol && colIndex <= activeRange.maxCol;

    let cellBg: CellBgType;
    if (isSelectionStartCell) {
      cellBg = 'focused';
    } else if (isInSelection) {
      cellBg = 'selected';
    } else {
      cellBg = 'default';
    }

    return { cellBg, rowBg };
  }, [selectionStart, activeRange]);

  // 色タイプからスタイルを生成
  const getCellColorStyle = useCallback((colorTypes: CellColorTypes): CSSProperties => {
    let baseBgColor: string;
    switch (colorTypes.rowBg) {
      case 'red':
        baseBgColor = '#fee2e2';
        break;
      case 'green':
        baseBgColor = '#dcfce7';
        break;
      case 'yellow':
        baseBgColor = '#fef9c3';
        break;
      case 'stripe-even':
        baseBgColor = 'rgba(255, 255, 255, 0.8)';
        break;
      case 'stripe-odd':
        baseBgColor = 'rgba(249, 250, 251, 0.8)';
        break;
      default:
        baseBgColor = 'rgba(255, 255, 255, 0.8)';
    }

    let finalBgColor = baseBgColor;
    switch (colorTypes.cellBg) {
      case 'focused':
        finalBgColor = blendColors(baseBgColor, 'rgba(191, 219, 254, 0.8)');
        break;
      case 'selected':
        finalBgColor = baseBgColor;
        break;
      case 'default':
      default:
        finalBgColor = baseBgColor;
        break;
    }

    return { backgroundColor: finalBgColor };
  }, []);

  // 行のクラス名を取得
  const getRowClassName = (rowIndex: number) => {
    const customClasses =
      rowClassName && data[rowIndex]
        ? rowClassName(rowIndex, data[rowIndex])
        : '';

    return `${customClasses} will-change-transform transform-gpu`;
  };

  // セルのスタイルを取得（色・ハイライト）
  const getCellStyle = (row: Record<string, unknown>): CSSProperties => {
    const styles: CSSProperties = {};

    if (enableRowColors && colorField && colorMap[String(row[colorField])]) {
      const colorConfig = colorMap[String(row[colorField])];
      if (typeof colorConfig === 'string') {
        styles.backgroundColor = colorConfig;
      } else if (typeof colorConfig === 'object') {
        Object.assign(styles, colorConfig);
      }
    }

    if (highlightField && row[highlightField]) {
      styles.color = highlightColor;
    }

    return styles;
  };

  return {
    getCellBorderTypes,
    getCellBorderStyle,
    getCellSelectionStyle,
    getMarchingAntsClass,
    getCellColorTypes,
    getCellColorStyle,
    getRowClassName,
    getCellStyle,
  };
};
