// src/hooks/useToast.ts
import { useState, useCallback } from 'react';

export interface ToastOptions {
  type?: 'info' | 'warning' | 'error' | 'success';
  duration?: number; // 自動で閉じるまでの時間(ms)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface ToastState extends ToastOptions {
  isOpen: boolean;
  message: string;
}

/**
 * Toast通知を管理するカスタムフック
 * オーバーレイなしの軽量な通知に使用
 *
 * @example
 * const { toastState, showToast, closeToast } = useToast();
 *
 * // 基本的な使い方
 * showToast('保存しました', { type: 'success' });
 *
 * // JSX内で
 * <Toast {...toastState} onClose={closeToast} />
 */
export const useToast = () => {
  const [toastState, setToastState] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'info',
    duration: 3000,
    position: 'top-right',
  });

  /**
   * Toastを表示
   */
  const showToast = useCallback((message: string, options?: ToastOptions) => {
    setToastState({
      isOpen: true,
      message,
      type: options?.type || 'info',
      duration: options?.duration ?? 3000,
      position: options?.position || 'top-right',
    });
  }, []);

  /**
   * Toastを閉じる
   */
  const closeToast = useCallback(() => {
    setToastState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    toastState,
    showToast,
    closeToast,
  };
};
