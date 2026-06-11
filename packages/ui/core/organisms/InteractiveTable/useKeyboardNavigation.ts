/**
 * useKeyboardNavigation - キーボードナビゲーションロジック
 *
 * 矢印キー移動、Shift+矢印範囲選択、Tab移動、
 * Home/End、Ctrl+A全選択、Ctrl+Cコピー、Enter/Space操作を担当。
 * useCellSelection の返り値に依存する。
 */
import { useCallback } from 'react';

import type {
  Column,
  FocusedCell,
  SelectedCell,
  ActiveRange,
  LinkData,
  InternalLinkData,
  TableRowData,
} from './types';

interface UseKeyboardNavigationParams {
  data: TableRowData[];
  columns: Column[];
  enableKeyboardNavigation: boolean;
  enableCellSelection: boolean;
  enableSelection: boolean;
  // selection state (from useCellSelection)
  selectionStart: SelectedCell | null;
  setSelectionStart: (cell: SelectedCell | null) => void;
  selectionEnd: SelectedCell | null;
  setSelectionEnd: (cell: SelectedCell | null) => void;
  copiedRange: ActiveRange | null;
  setCopiedRange: (range: ActiveRange | null) => void;
  activeRange: ActiveRange | null;
  actualFocusedRow: number | null;
  actualSetFocusedRow: (row: number | null) => void;
  actualFocusedCell: FocusedCell | null;
  actualSetFocusedCell: (cell: FocusedCell | null) => void;
  actualSelectedRows: number[];
  actualSetSelectedRows: (rows: number[]) => void;
  getSelectedRowIndices: () => number[];
  skipNextScrollRef: React.MutableRefObject<boolean>;
  // refs
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  tableRefs: React.MutableRefObject<(HTMLElement | null)[][]>;
  // callbacks
  onCellClick?: (rowIndex: number, colIndex: number, column: Column, row: TableRowData) => void;
  onKeyboardNavigation?: (event: React.KeyboardEvent, focusedCell: { row: number; col: number } | null) => void;
  onLinkClick?: (linkData: LinkData, rowIndex: number, colIndex: number) => void;
  onInternalLinkClick?: (linkData: InternalLinkData, rowIndex: number, colIndex: number) => void;
}

interface UseKeyboardNavigationReturn {
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleCellClick: (rowIndex: number, colIndex: number, column: Column) => void;
}

export const useKeyboardNavigation = ({
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
}: UseKeyboardNavigationParams): UseKeyboardNavigationReturn => {

  const handleCellClick = useCallback((
    rowIndex: number,
    colIndex: number,
    column: Column
  ) => {
    actualSetFocusedRow(rowIndex);
    actualSetFocusedCell({ row: rowIndex, col: colIndex });

    if (enableKeyboardNavigation && tableContainerRef.current) {
      tableContainerRef.current.focus({ preventScroll: true });
    }

    if (onCellClick && data[rowIndex]) {
      onCellClick(rowIndex, colIndex, column, data[rowIndex]);
    }
  }, [actualSetFocusedRow, actualSetFocusedCell, enableKeyboardNavigation, tableContainerRef, onCellClick, data]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (
      !enableKeyboardNavigation ||
      data.length === 0 ||
      columns.length === 0
    ) {
      return;
    }

    const currentCell = actualFocusedCell || { row: 0, col: 0 };
    const safeRow = Math.max(0, Math.min(currentCell.row, data.length - 1));
    const safeCol = Math.max(0, Math.min(currentCell.col, columns.length - 1));

    const isShiftArrowSelection = event.shiftKey && enableCellSelection &&
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);

    const endCell = selectionEnd ?? selectionStart;
    const endRow = isShiftArrowSelection && endCell
      ? Math.max(0, Math.min(endCell.row, data.length - 1))
      : safeRow;
    const endCol = isShiftArrowSelection && endCell
      ? Math.max(0, Math.min(endCell.col, columns.length - 1))
      : safeCol;

    let newRow = safeRow;
    let newCol = safeCol;
    let shouldPreventDefault = true;
    let selectionAlreadyHandled = false;

    switch (event.key) {
      case 'ArrowUp':
        if (isShiftArrowSelection) {
          newRow = Math.max(0, endRow - 1);
          newCol = endCol;
        } else {
          newRow = Math.max(0, safeRow - 1);
        }
        break;
      case 'ArrowDown':
        if (isShiftArrowSelection) {
          newRow = Math.min(data.length - 1, endRow + 1);
          newCol = endCol;
        } else {
          newRow = Math.min(data.length - 1, safeRow + 1);
        }
        break;
      case 'ArrowLeft':
        if (isShiftArrowSelection) {
          newCol = Math.max(0, endCol - 1);
          newRow = endRow;
        } else {
          newCol = Math.max(0, safeCol - 1);
        }
        break;
      case 'ArrowRight':
        if (isShiftArrowSelection) {
          newCol = Math.min(columns.length - 1, endCol + 1);
          newRow = endRow;
        } else {
          newCol = Math.min(columns.length - 1, safeCol + 1);
        }
        break;
      case 'Tab':
        if (event.shiftKey) {
          if (safeCol > 0) {
            newCol = safeCol - 1;
          } else if (safeRow > 0) {
            newRow = safeRow - 1;
            newCol = columns.length - 1;
          }
        } else {
          if (safeCol < columns.length - 1) {
            newCol = safeCol + 1;
          } else if (safeRow < data.length - 1) {
            newRow = safeRow + 1;
            newCol = 0;
          }
        }
        break;
      case 'Home':
        if (event.shiftKey && enableCellSelection) {
          if (!selectionStart) {
            setSelectionStart({ row: safeRow, col: safeCol });
          }
          setSelectionEnd({ row: safeRow, col: 0 });
          newCol = 0;
          selectionAlreadyHandled = true;
        } else if (event.ctrlKey) {
          newRow = 0;
          newCol = 0;
        } else {
          newCol = 0;
        }
        break;
      case 'End':
        if (event.shiftKey && enableCellSelection) {
          if (!selectionStart) {
            setSelectionStart({ row: safeRow, col: safeCol });
          }
          setSelectionEnd({ row: safeRow, col: columns.length - 1 });
          newCol = columns.length - 1;
          selectionAlreadyHandled = true;
        } else if (event.ctrlKey) {
          newRow = data.length - 1;
          newCol = columns.length - 1;
        } else {
          newCol = columns.length - 1;
        }
        break;
      case 'a':
        if ((event.ctrlKey || event.metaKey) && enableCellSelection) {
          setSelectionStart({ row: 0, col: 0 });
          setSelectionEnd({ row: data.length - 1, col: columns.length - 1 });
          selectionAlreadyHandled = true;
          skipNextScrollRef.current = true;
        } else {
          shouldPreventDefault = false;
        }
        break;
      case ' ':
      case 'Enter':
        if (enableSelection && enableCellSelection && activeRange !== null) {
          const selectedRowIndices = getSelectedRowIndices();
          const allSelected = selectedRowIndices.every(row => actualSelectedRows.includes(row));
          if (allSelected) {
            actualSetSelectedRows(actualSelectedRows.filter(row => !selectedRowIndices.includes(row)));
          } else {
            const newSelectedRows = [...new Set([...actualSelectedRows, ...selectedRowIndices])];
            actualSetSelectedRows(newSelectedRows);
          }
          break;
        }
        if (enableSelection && actualFocusedRow !== null) {
          const isRowChecked = actualSelectedRows.includes(actualFocusedRow);
          if (isRowChecked) {
            actualSetSelectedRows(actualSelectedRows.filter(row => row !== actualFocusedRow));
          } else {
            actualSetSelectedRows([...actualSelectedRows, actualFocusedRow]);
          }
          break;
        }
        if (event.key === 'Enter' && data[safeRow]) {
          const currentColumn = columns[safeCol];
          const cellValue = data[safeRow][currentColumn.accessor];

          if (
            currentColumn.cellType === 'internal' &&
            cellValue &&
            typeof cellValue === 'object' &&
            'to' in cellValue
          ) {
            const internalLinkData = cellValue as InternalLinkData;
            const linkData = {
              text: internalLinkData.text || internalLinkData.to,
              to: internalLinkData.to,
              variant: internalLinkData.variant || 'text',
              size: internalLinkData.size || 'medium',
              color: internalLinkData.color || 'primary',
            };

            if (onInternalLinkClick) {
              onInternalLinkClick(linkData, safeRow, safeCol);
            } else {
              window.location.href = internalLinkData.to;
            }
          } else if (currentColumn.cellType === 'link' && cellValue) {
            let linkData: LinkData | undefined;

            if (typeof cellValue === 'string') {
              linkData = {
                text: cellValue,
                url: cellValue,
                target: '_blank' as const,
              };
            } else if (typeof cellValue === 'object' && 'url' in cellValue) {
              const externalLinkData = cellValue as LinkData;
              linkData = {
                text: externalLinkData.text || externalLinkData.url,
                url: externalLinkData.url,
                target: externalLinkData.target || ('_blank' as const),
              };
            }

            if (linkData) {
              if (onLinkClick) {
                onLinkClick(linkData, safeRow, safeCol);
              } else {
                window.open(linkData.url, linkData.target || '_blank');
              }
            }
          } else {
            handleCellClick(safeRow, safeCol, currentColumn);
          }
        }
        break;
      case 'c':
        if ((event.ctrlKey || event.metaKey) && enableCellSelection && activeRange !== null) {
          const { minRow, maxRow, minCol, maxCol } = activeRange;

          const lines: string[] = [];
          for (let r = minRow; r <= maxRow; r++) {
            const rowData = data[r];
            const cellValues: string[] = [];
            for (let c = minCol; c <= maxCol; c++) {
              const column = columns[c];
              const cellValue = rowData?.[column?.accessor];
              let textValue = '';
              if (cellValue === null || cellValue === undefined) {
                textValue = '';
              } else if (typeof cellValue === 'object') {
                if ('text' in cellValue) {
                  textValue = String(cellValue.text);
                } else if ('url' in cellValue) {
                  textValue = String(cellValue.url);
                } else if ('to' in cellValue) {
                  textValue = String(cellValue.to);
                } else {
                  textValue = JSON.stringify(cellValue);
                }
              } else {
                textValue = String(cellValue);
              }
              cellValues.push(textValue);
            }
            lines.push(cellValues.join('\t'));
          }
          const clipboardText = lines.join('\n');

          setCopiedRange({ minRow, maxRow, minCol, maxCol });
          setSelectionStart(null);
          setSelectionEnd(null);

          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(clipboardText).catch(() => {
              const textArea = document.createElement('textarea');
              textArea.value = clipboardText;
              textArea.style.position = 'fixed';
              textArea.style.left = '-9999px';
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
            });
          } else {
            const textArea = document.createElement('textarea');
            textArea.value = clipboardText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }
        } else {
          shouldPreventDefault = false;
        }
        break;
      case 'Escape':
        if (copiedRange) {
          setCopiedRange(null);
        }
        break;
      default:
        shouldPreventDefault = false;
        break;
    }

    if (shouldPreventDefault) {
      event.preventDefault();

      if (!selectionAlreadyHandled && (newRow !== safeRow || newCol !== safeCol)) {
        actualSetFocusedCell({ row: newRow, col: newCol });
        actualSetFocusedRow(newRow);

        if (isShiftArrowSelection) {
          if (!selectionStart) {
            setSelectionStart({ row: safeRow, col: safeCol });
            setSelectionEnd({ row: safeRow, col: safeCol });
          }
          setSelectionEnd({ row: newRow, col: newCol });
        } else if (enableCellSelection) {
          setSelectionStart({ row: newRow, col: newCol });
          setSelectionEnd({ row: newRow, col: newCol });
        }

        if (tableRefs.current[newRow]?.[newCol]) {
          tableRefs.current[newRow][newCol]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
        }
      }

      if (onKeyboardNavigation) {
        onKeyboardNavigation(event, { row: newRow, col: newCol });
      }
    }
  }, [
    enableKeyboardNavigation, enableCellSelection, enableSelection,
    data, columns,
    selectionStart, setSelectionStart, selectionEnd, setSelectionEnd,
    copiedRange, setCopiedRange, activeRange,
    actualFocusedRow, actualSetFocusedRow,
    actualFocusedCell, actualSetFocusedCell,
    actualSelectedRows, actualSetSelectedRows,
    getSelectedRowIndices, skipNextScrollRef,
    tableRefs,
    handleCellClick,
    onKeyboardNavigation, onLinkClick, onInternalLinkClick,
  ]);

  return {
    handleKeyDown,
    handleCellClick,
  };
};
