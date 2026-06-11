/**
 * useColumnResize - 列リサイズロジック
 *
 * テーブルヘッダーのドラッグによる列幅変更を担当。
 * リサイズ中のマウスイベント管理とwidth計算を行う。
 */
import { useState, useRef, useEffect, useCallback } from 'react';

import { isNullish } from '../../utils';

import type { Column } from './types';

interface UseColumnResizeParams {
  columns: Column[];
  enableSelection: boolean;
  columnWidthsResetKey: number;
}

interface UseColumnResizeReturn {
  columnWidths: Record<string, string>;
  handleResizeStart: (e: React.MouseEvent, columnIndex: number) => void;
  getColumnProportion: (column: Column) => string | number;
}

export const useColumnResize = ({
  columns,
  enableSelection,
  columnWidthsResetKey,
}: UseColumnResizeParams): UseColumnResizeReturn => {
  const [columnWidths, setColumnWidths] = useState<Record<string, string>>({});
  const resizeStartX = useRef<number>(0);

  // columnWidthsResetKeyが変わったら列幅をリセット
  useEffect(() => {
    if (columnWidthsResetKey > 0) {
      setColumnWidths({});
    }
  }, [columnWidthsResetKey]);

  // 列リサイズのハンドラー
  const handleResizeStart = useCallback((e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const tableElement = e.currentTarget.closest('table') as HTMLElement;
    if (!tableElement) return;

    const tableWidth = tableElement.offsetWidth;

    // 現在の各列の実際の幅を取得
    const currentWidths: number[] = [];
    const headerCells = tableElement.querySelectorAll('th');
    headerCells.forEach((cell, index) => {
      // enableSelectionの場合、最初のthはチェックボックス列なのでスキップ
      const adjustedIndex = enableSelection ? index - 1 : index;
      if (adjustedIndex >= 0 && adjustedIndex < columns.length) {
        currentWidths[adjustedIndex] = cell.offsetWidth;
      }
    });

    resizeStartX.current = e.clientX;

    const handleMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - resizeStartX.current;

      // 最小幅を3%とする
      const minWidthPx = tableWidth * 0.03;

      if (Math.abs(deltaX) < 1) return;

      const reductionNeeded = Math.abs(deltaX);
      let remainingReduction = reductionNeeded;

      const newColumnWidths: Record<string, string> = {};

      const getCurrentWidth = (colIndex: number): number => {
        const accessor = columns[colIndex].accessor;
        if (newColumnWidths[accessor]) {
          const percentage = parseFloat(newColumnWidths[accessor].replace('%', ''));
          return (percentage / 100) * tableWidth;
        }
        return currentWidths[colIndex];
      };

      const recursiveResize = (
        targetColumnIndex: number,
        mainColumnIndex: number,
        dragDirection: 'left' | 'right'
      ): void => {
        if (remainingReduction <= 0) return;

        const targetCurrentWidth = getCurrentWidth(targetColumnIndex);
        const targetMaxReduction = Math.max(0, targetCurrentWidth - minWidthPx);
        const actualReduction = Math.min(remainingReduction, targetMaxReduction);

        if (actualReduction > 0) {
          const targetNewWidth = targetCurrentWidth - actualReduction;
          newColumnWidths[columns[targetColumnIndex].accessor] =
            `${((targetNewWidth / tableWidth) * 100).toFixed(2)}%`;

          const mainCurrentWidth = getCurrentWidth(mainColumnIndex);
          const mainNewWidth = mainCurrentWidth + actualReduction;
          newColumnWidths[columns[mainColumnIndex].accessor] =
            `${((mainNewWidth / tableWidth) * 100).toFixed(2)}%`;

          remainingReduction -= actualReduction;
        }

        if (remainingReduction > 0 && actualReduction === targetMaxReduction) {
          let nextTargetIndex: number | null = null;

          if (dragDirection === 'left') {
            if (targetColumnIndex - 1 >= 0) {
              nextTargetIndex = targetColumnIndex - 1;
            }
          } else {
            if (targetColumnIndex + 1 < columns.length) {
              nextTargetIndex = targetColumnIndex + 1;
            }
          }

          if (!isNullish(nextTargetIndex)) {
            recursiveResize(nextTargetIndex, mainColumnIndex, dragDirection);
          }
        }
      };

      if (deltaX > 0) {
        if (columnIndex + 1 < columns.length) {
          recursiveResize(columnIndex + 1, columnIndex, 'right');
        }
      } else {
        if (columnIndex + 1 < columns.length) {
          recursiveResize(columnIndex, columnIndex + 1, 'left');
        }
      }

      setColumnWidths((prev) => ({ ...prev, ...newColumnWidths }));
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [columns, enableSelection]);

  // 列幅を取得する関数
  const getColumnProportion = useCallback((column: Column): string | number => {
    // リサイズ後の幅が存在する場合はそれを優先
    if (columnWidths[column.accessor]) {
      return columnWidths[column.accessor];
    }

    // proportionが数値の場合、全列の数値proportionの合計を計算して%に変換
    if (typeof column.proportion === 'number') {
      const totalNumericProportion = columns.reduce((sum, col) => {
        return sum + (typeof col.proportion === 'number' ? col.proportion : 0);
      }, 0);

      if (totalNumericProportion > 0) {
        // enableSelectionがtrueの場合、チェックボックス列(3%)を除いた97%で計算
        const availablePercent = enableSelection ? 97 : 100;
        const percentage = (column.proportion / totalNumericProportion) * availablePercent;
        return `${percentage.toFixed(2)}%`;
      }
    }

    // proportionが文字列の場合はそのまま返す
    return column.proportion || 'auto';
  }, [columnWidths, columns, enableSelection]);

  return {
    columnWidths,
    handleResizeStart,
    getColumnProportion,
  };
};
