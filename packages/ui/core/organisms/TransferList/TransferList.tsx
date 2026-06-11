'use client'

/**
 * TransferList コンポーネント
 *
 * 2つのリスト間でアイテムを移動させる汎用コンポーネント
 * - 左側: 有効/閲覧可能などのアイテム
 * - 右側: 無効/閲覧不可などのアイテム
 * - チェックボックスで選択 → ボタンで移動
 */
import { useState, useCallback, useMemo } from 'react';

import { Checkbox } from '../../atoms';
import type { TransferListProps, TransferListItem } from './types';
import styles from './TransferList.module.scss';

/**
 * TransferList コンポーネント
 */
export function TransferList<T extends TransferListItem = TransferListItem>({
  leftItems,
  rightItems,
  leftLabel,
  rightLabel,
  toRightLabel = '\u2192',
  toLeftLabel = '\u2190',
  leftIcon,
  rightIcon,
  onChange,
  loading = false,
  minHeight = '300px',
}: TransferListProps<T>) {
  // 左側の選択状態
  const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set());
  // 右側の選択状態
  const [rightSelected, setRightSelected] = useState<Set<string>>(new Set());

  // 左側の選択可能なアイテム数
  const leftSelectableCount = useMemo(
    () => leftItems.filter(item => !item.disabled).length,
    [leftItems]
  );

  // 右側の選択可能なアイテム数
  const rightSelectableCount = useMemo(
    () => rightItems.filter(item => !item.disabled).length,
    [rightItems]
  );

  // 左側のチェックボックス変更
  const handleLeftCheck = useCallback((id: string, checked: boolean) => {
    setLeftSelected(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  // 右側のチェックボックス変更
  const handleRightCheck = useCallback((id: string, checked: boolean) => {
    setRightSelected(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  // 左側の全選択/解除
  const handleLeftSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const selectableIds = leftItems.filter(item => !item.disabled).map(item => item.id);
      setLeftSelected(new Set(selectableIds));
    } else {
      setLeftSelected(new Set());
    }
  }, [leftItems]);

  // 右側の全選択/解除
  const handleRightSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const selectableIds = rightItems.filter(item => !item.disabled).map(item => item.id);
      setRightSelected(new Set(selectableIds));
    } else {
      setRightSelected(new Set());
    }
  }, [rightItems]);

  // 左→右に移動（無効化）
  const handleMoveToRight = useCallback(() => {
    if (leftSelected.size === 0 || loading) return;

    const itemsToMove = leftItems.filter(item => leftSelected.has(item.id) && !item.disabled);
    const remainingLeft = leftItems.filter(item => !leftSelected.has(item.id) || item.disabled);
    const newRight = [...rightItems, ...itemsToMove];

    onChange(remainingLeft, newRight);
    setLeftSelected(new Set());
  }, [leftItems, rightItems, leftSelected, onChange, loading]);

  // 右→左に移動（有効化）
  const handleMoveToLeft = useCallback(() => {
    if (rightSelected.size === 0 || loading) return;

    const itemsToMove = rightItems.filter(item => rightSelected.has(item.id) && !item.disabled);
    const remainingRight = rightItems.filter(item => !rightSelected.has(item.id) || item.disabled);
    const newLeft = [...leftItems, ...itemsToMove];

    onChange(newLeft, remainingRight);
    setRightSelected(new Set());
  }, [leftItems, rightItems, rightSelected, onChange, loading]);

  // アイテムカードのレンダリング
  const renderItem = useCallback((
    item: T,
    selected: boolean,
    onCheck: (id: string, checked: boolean) => void
  ) => {
    const isDisabled = item.disabled || loading;

    const itemClasses = [
      styles.item,
      isDisabled ? styles['item--disabled'] : styles['item--enabled'],
      selected && !isDisabled ? styles['item--selected'] : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={item.id}
        className={itemClasses}
        onClick={() => !isDisabled && onCheck(item.id, !selected)}
      >
        <Checkbox
          checked={selected}
          disabled={isDisabled}
          onChange={(e) => onCheck(item.id, e.target.checked)}
          size="medium"
          variant="primary"
        />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{item.label}</div>
          {item.subLabel && (
            <div className={styles.itemSubLabel}>{item.subLabel}</div>
          )}
        </div>
        {item.disabled && item.disabledReason && (
          <div className={styles.disabledReason}>
            {item.disabledReason}
          </div>
        )}
      </div>
    );
  }, [loading]);

  // 左側の全選択状態
  const isLeftAllSelected = leftSelectableCount > 0 && leftSelected.size === leftSelectableCount;
  const isLeftIndeterminate = leftSelected.size > 0 && leftSelected.size < leftSelectableCount;

  // 右側の全選択状態
  const isRightAllSelected = rightSelectableCount > 0 && rightSelected.size === rightSelectableCount;
  const isRightIndeterminate = rightSelected.size > 0 && rightSelected.size < rightSelectableCount;

  return (
    <div className={styles.root}>
      {/* 左側リスト */}
      <div className={styles.column}>
        <div
          className={styles.listBox}
          style={{ minHeight }}
        >
          {/* ヘッダー */}
          <div className={styles.header}>
            {leftIcon}
            <h4 className={styles.headerLabel}>{leftLabel}</h4>
            <span className={styles.headerCount}>({leftItems.length})</span>
          </div>

          {/* 全選択 */}
          {leftSelectableCount > 0 && (
            <div className={styles.selectAll}>
              <Checkbox
                checked={isLeftAllSelected || isLeftIndeterminate}
                onChange={(e) => handleLeftSelectAll(e.target.checked)}
                disabled={loading}
                size="small"
                variant="primary"
                label="すべて選択"
              />
            </div>
          )}

          {/* アイテムリスト */}
          <div className={styles.itemList}>
            {leftItems.length > 0 ? (
              leftItems.map(item => renderItem(item, leftSelected.has(item.id), handleLeftCheck))
            ) : (
              <div className={styles.emptyMessage}>
                アイテムがありません
              </div>
            )}
          </div>
        </div>

        {/* 無効化ボタン */}
        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={handleMoveToRight}
            disabled={leftSelected.size === 0 || loading}
            className={[
              styles.moveButton,
              leftSelected.size > 0 && !loading
                ? styles['moveButton--toRight']
                : styles['moveButton--disabled'],
            ].filter(Boolean).join(' ')}
          >
            {toRightLabel}
          </button>
        </div>
      </div>

      {/* 右側リスト */}
      <div className={styles.column}>
        <div
          className={styles.listBox}
          style={{ minHeight }}
        >
          {/* ヘッダー */}
          <div className={styles.header}>
            {rightIcon}
            <h4 className={styles.headerLabel}>{rightLabel}</h4>
            <span className={styles.headerCount}>({rightItems.length})</span>
          </div>

          {/* 全選択 */}
          {rightSelectableCount > 0 && (
            <div className={styles.selectAll}>
              <Checkbox
                checked={isRightAllSelected || isRightIndeterminate}
                onChange={(e) => handleRightSelectAll(e.target.checked)}
                disabled={loading}
                size="small"
                variant="primary"
                label="すべて選択"
              />
            </div>
          )}

          {/* アイテムリスト */}
          <div className={styles.itemList}>
            {rightItems.length > 0 ? (
              rightItems.map(item => renderItem(item, rightSelected.has(item.id), handleRightCheck))
            ) : (
              <div className={styles.emptyMessage}>
                アイテムがありません
              </div>
            )}
          </div>
        </div>

        {/* 有効化ボタン */}
        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={handleMoveToLeft}
            disabled={rightSelected.size === 0 || loading}
            className={[
              styles.moveButton,
              rightSelected.size > 0 && !loading
                ? styles['moveButton--toLeft']
                : styles['moveButton--disabled'],
            ].filter(Boolean).join(' ')}
          >
            {toLeftLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { TransferListProps, TransferListItem } from './types';
