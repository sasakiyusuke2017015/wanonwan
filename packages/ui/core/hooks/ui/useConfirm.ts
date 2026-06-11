// src/hooks/useConfirm.ts
import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title?: string;
  type?: 'info' | 'warning' | 'error' | 'danger';
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

/**
 * 確認ダイアログを管理するカスタムフック
 * window.confirmの代替として使用
 *
 * @example
 * const { confirmState, showConfirm, handleConfirm, handleCancel } = useConfirm();
 *
 * // 使用例
 * const handleDelete = () => {
 *   showConfirm('削除してもよろしいですか？', {
 *     title: '削除確認',
 *     type: 'danger',
 *     onConfirm: async () => {
 *       await deleteItem();
 *     }
 *   });
 * };
 *
 * // JSX内で
 * <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
 */
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    title: undefined,
    type: 'info',
    confirmText: '確定',
    cancelText: 'キャンセル',
    onConfirm: () => {},
  });

  /**
   * 確認ダイアログを表示
   */
  const showConfirm = useCallback(
    (message: string, options?: ConfirmOptions & { onConfirm: () => void }) => {
      setConfirmState({
        isOpen: true,
        message,
        title: options?.title,
        type: options?.type || 'info',
        confirmText: options?.confirmText || '確定',
        cancelText: options?.cancelText || 'キャンセル',
        onConfirm: options?.onConfirm || (() => {}),
      });
    },
    []
  );

  /**
   * 確定ボタンが押された時
   */
  const handleConfirm = useCallback(() => {
    confirmState.onConfirm();
    setConfirmState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, [confirmState]);

  /**
   * キャンセルボタンが押された時
   */
  const handleCancel = useCallback(() => {
    setConfirmState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    confirmState,
    showConfirm,
    handleConfirm,
    handleCancel,
  };
};
