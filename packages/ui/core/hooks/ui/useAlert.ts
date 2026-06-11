// src/hooks/useAlert.ts
import { useState, useCallback } from 'react';

export interface AlertOptions {
  title?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
}

export interface AlertState extends AlertOptions {
  isOpen: boolean;
  message: string;
}

/**
 * アラートダイアログを管理するカスタムフック
 * window.alertの代替として使用
 *
 * @example
 * const { alertState, showAlert, closeAlert } = useAlert();
 *
 * // 基本的な使い方
 * showAlert('保存しました');
 *
 * // オプション付き
 * showAlert('保存に失敗しました。時間をおいて再度お試しください。', {
 *   title: 'エラー',
 *   type: 'error'
 * });
 *
 * // JSX内で
 * <AlertDialog {...alertState} onClose={closeAlert} />
 */
export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    title: undefined,
    type: 'info',
    confirmText: '閉じる',
  });

  /**
   * アラートを表示
   */
  const showAlert = useCallback((message: string, options?: AlertOptions) => {
    setAlertState({
      isOpen: true,
      message,
      title: options?.title,
      type: options?.type || 'info',
      confirmText: options?.confirmText || '閉じる',
    });
  }, []);

  /**
   * アラートを閉じる
   */
  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    alertState,
    showAlert,
    closeAlert,
  };
};
