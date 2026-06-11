/**
 * useCellSelection - セル選択・ドラッグ・自動スクロールロジック
 *
 * セル選択範囲の管理、ドラッグ操作、自動スクロール、
 * 行チェックボックス選択を担当。
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

import type {
  FocusedCell,
  SelectedCell,
  ActiveRange,
  TableRowData,
} from './types';

interface UseCellSelectionParams {
  data: TableRowData[];
  enableCellSelection: boolean;
  enableKeyboardNavigation: boolean;
  // 外部制御（外部→内部のフォールバック）
  focusedRow?: number | null;
  setFocusedRow?: (row: number | null) => void;
  focusedCell?: FocusedCell | null;
  setFocusedCell?: (cell: FocusedCell | null) => void;
  selectedRows?: number[];
  onSelectionChange?: (selectedRows: number[]) => void;
  selectedCells?: SelectedCell[];
  onCellSelectionChange?: (selectedCells: SelectedCell[]) => void;
  // refs
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  tableRefs: React.MutableRefObject<(HTMLElement | null)[][]>;
}

interface UseCellSelectionReturn {
  // state
  selectionStart: SelectedCell | null;
  setSelectionStart: (cell: SelectedCell | null) => void;
  selectionEnd: SelectedCell | null;
  setSelectionEnd: (cell: SelectedCell | null) => void;
  copiedRange: ActiveRange | null;
  setCopiedRange: (range: ActiveRange | null) => void;
  activeRange: ActiveRange | null;
  // 外部制御の実体
  actualFocusedRow: number | null;
  actualSetFocusedRow: (row: number | null) => void;
  actualFocusedCell: FocusedCell | null;
  actualSetFocusedCell: (cell: FocusedCell | null) => void;
  actualSelectedRows: number[];
  actualSetSelectedRows: (rows: number[]) => void;
  // handlers
  handleSelectAll: (checked: boolean) => void;
  handleSelectRow: (rowIndex: number, checked: boolean) => void;
  handleCellMouseDown: (row: number, col: number, event: React.MouseEvent) => void;
  handleCellMouseEnter: (row: number, col: number) => void;
  handleCellMouseUp: () => void;
  // scroll helpers
  scrollToCell: (row: number, col: number) => void;
  // derived
  getSelectedRowIndices: () => number[];
  // スクロールスキップref（Ctrl+A等でスクロール追随をスキップ）
  skipNextScrollRef: React.MutableRefObject<boolean>;
}

export const useCellSelection = ({
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
}: UseCellSelectionParams): UseCellSelectionReturn => {

  // 内部で自動管理するfocusedRow（外部から渡されない場合に使用）
  const [internalFocusedRow, setInternalFocusedRow] = useState<number | null>(null);
  const [internalFocusedCell, setInternalFocusedCell] = useState<FocusedCell | null>(null);
  const [internalSelectedRows, setInternalSelectedRows] = useState<number[]>([]);

  // NOTE: selectedCells, onCellSelectionChange propsは将来の拡張のため維持（現在は未使用）
  void selectedCells;
  void onCellSelectionChange;

  // 実際に使用する値（外部制御が優先、なければ内部管理）
  const actualFocusedRow = focusedRow ?? internalFocusedRow;
  const actualSetFocusedRow = setFocusedRow ?? setInternalFocusedRow;
  const actualFocusedCell = focusedCell ?? internalFocusedCell;
  const actualSetFocusedCell = setFocusedCell ?? setInternalFocusedCell;
  const actualSelectedRows = selectedRows ?? internalSelectedRows;
  const actualSetSelectedRows = onSelectionChange ?? setInternalSelectedRows;

  // セル選択範囲（開始セルと終了セルのみ保持）
  const [selectionStart, setSelectionStart] = useState<SelectedCell | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<SelectedCell | null>(null);

  // セル選択用のref
  const isDraggingRef = useRef<boolean>(false);

  // コピーされた範囲（しましまボーダー表示用）
  const [copiedRange, setCopiedRange] = useState<ActiveRange | null>(null);

  // アクティブな範囲選択（開始セルと終了セルから計算）
  const activeRange: ActiveRange | null = useMemo(() => {
    if (!selectionStart) return null;
    const end = selectionEnd ?? selectionStart;
    return {
      minRow: Math.min(selectionStart.row, end.row),
      maxRow: Math.max(selectionStart.row, end.row),
      minCol: Math.min(selectionStart.col, end.col),
      maxCol: Math.max(selectionStart.col, end.col),
    };
  }, [selectionStart, selectionEnd]);

  // 選択範囲内の行インデックスを取得
  const getSelectedRowIndices = useCallback((): number[] => {
    if (!activeRange) return [];
    const rows: number[] = [];
    for (let r = activeRange.minRow; r <= activeRange.maxRow; r++) {
      rows.push(r);
    }
    return rows;
  }, [activeRange]);

  // ドラッグ中の自動スクロール用
  const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoScrollDirectionRef = useRef<{ vertical: 'up' | 'down' | null; horizontal: 'left' | 'right' | null }>({
    vertical: null,
    horizontal: null,
  });
  const skipNextScrollRef = useRef<boolean>(false);

  // 自動スクロールを停止
  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    autoScrollDirectionRef.current = { vertical: null, horizontal: null };
  }, []);

  // セルが見えるようにスクロールする関数（即時スクロール）
  const scrollToCell = useCallback((row: number, col: number) => {
    if (row < 0 || col < 0 || !scrollContainerRef.current) return;

    const cell = tableRefs.current[row]?.[col];
    if (!cell) return;

    const container = scrollContainerRef.current;
    const cellRect = cell.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // ヘッダーの高さを考慮（stickyヘッダー分）
    const headerHeight = 48;

    // 縦スクロール：セルが見えない場合のみスクロール
    if (cellRect.top < containerRect.top + headerHeight) {
      container.scrollTop -= (containerRect.top + headerHeight - cellRect.top);
    } else if (cellRect.bottom > containerRect.bottom) {
      container.scrollTop += (cellRect.bottom - containerRect.bottom);
    }

    // 横スクロール：セルが見えない場合のみスクロール
    if (cellRect.left < containerRect.left) {
      container.scrollLeft -= (containerRect.left - cellRect.left);
    } else if (cellRect.right > containerRect.right) {
      container.scrollLeft += (cellRect.right - containerRect.right);
    }
  }, [scrollContainerRef, tableRefs]);

  // ドラッグ中の自動スクロールを開始
  const startAutoScroll = useCallback((row: number, col: number) => {
    if (!scrollContainerRef.current) return;

    const cell = tableRefs.current[row]?.[col];
    if (!cell) return;

    const container = scrollContainerRef.current;
    const cellRect = cell.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const headerHeight = 48;
    const scrollSpeed = 30;
    const scrollInterval = 100;

    let vertical: 'up' | 'down' | null = null;
    let horizontal: 'left' | 'right' | null = null;

    if (cellRect.top < containerRect.top + headerHeight) {
      vertical = 'up';
    } else if (cellRect.bottom > containerRect.bottom) {
      vertical = 'down';
    }

    if (cellRect.left < containerRect.left) {
      horizontal = 'left';
    } else if (cellRect.right > containerRect.right) {
      horizontal = 'right';
    }

    if (!vertical && !horizontal) {
      stopAutoScroll();
      return;
    }

    if (
      autoScrollDirectionRef.current.vertical === vertical &&
      autoScrollDirectionRef.current.horizontal === horizontal &&
      autoScrollIntervalRef.current
    ) {
      return;
    }

    stopAutoScroll();
    autoScrollDirectionRef.current = { vertical, horizontal };

    autoScrollIntervalRef.current = setInterval(() => {
      if (!scrollContainerRef.current) return;

      if (vertical === 'up') {
        scrollContainerRef.current.scrollTop -= scrollSpeed;
      } else if (vertical === 'down') {
        scrollContainerRef.current.scrollTop += scrollSpeed;
      }

      if (horizontal === 'left') {
        scrollContainerRef.current.scrollLeft -= scrollSpeed;
      } else if (horizontal === 'right') {
        scrollContainerRef.current.scrollLeft += scrollSpeed;
      }
    }, scrollInterval);
  }, [scrollContainerRef, tableRefs, stopAutoScroll]);

  // 選択機能のハンドラー
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allRows = data.map((_, index) => index);
      actualSetSelectedRows(allRows);
    } else {
      actualSetSelectedRows([]);
    }
  }, [data, actualSetSelectedRows]);

  const handleSelectRow = useCallback((rowIndex: number, checked: boolean) => {
    if (checked) {
      actualSetSelectedRows([...actualSelectedRows, rowIndex]);
    } else {
      actualSetSelectedRows(actualSelectedRows.filter(i => i !== rowIndex));
    }
  }, [actualSelectedRows, actualSetSelectedRows]);

  // セル選択: マウスダウン
  const handleCellMouseDown = useCallback((
    row: number,
    col: number,
    event: React.MouseEvent
  ) => {
    if (!enableCellSelection) return;

    // Shift+クリック: 範囲を終了セルまで拡張
    if (event.shiftKey && selectionStart) {
      event.preventDefault();
      setSelectionEnd({ row, col });
      return;
    }

    // 修飾キー時はテキスト選択を防止するが、ドラッグは開始しない
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    isDraggingRef.current = true;

    // マウスクリック時はスクロール追随をスキップ
    skipNextScrollRef.current = true;

    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });

    actualSetFocusedCell({ row, col });
    actualSetFocusedRow(row);

    if (enableKeyboardNavigation && tableContainerRef.current) {
      tableContainerRef.current.focus({ preventScroll: true });
    }

    document.body.style.userSelect = 'none';
  }, [enableCellSelection, enableKeyboardNavigation, selectionStart, actualSetFocusedCell, actualSetFocusedRow, tableContainerRef]);

  // ドラッグ中
  const handleCellMouseEnter = useCallback((row: number, col: number) => {
    if (!enableCellSelection || !isDraggingRef.current || !selectionStart) return;

    setSelectionEnd({ row, col });
    startAutoScroll(row, col);
  }, [enableCellSelection, selectionStart, startAutoScroll]);

  // ドラッグ終了
  const handleCellMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    stopAutoScroll();
  }, [stopAutoScroll]);

  // グローバルなmouseupイベントを監視
  useEffect(() => {
    if (!enableCellSelection) return;

    const handleGlobalMouseUp = () => {
      handleCellMouseUp();
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [enableCellSelection, handleCellMouseUp]);

  // コンポーネントアンマウント時に自動スクロールをクリア
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  // 選択の終点セル
  const effectiveEndRow = selectionEnd?.row ?? -1;
  const effectiveEndCol = selectionEnd?.col ?? -1;

  // 選択セルが変更されたときにスクロール追随（キーボード操作用）
  useEffect(() => {
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      return;
    }
    scrollToCell(effectiveEndRow, effectiveEndCol);
  }, [effectiveEndRow, effectiveEndCol, scrollToCell]);

  return {
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
    handleCellMouseUp,
    scrollToCell,
    getSelectedRowIndices,
    skipNextScrollRef,
  };
};
