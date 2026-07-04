'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { Toast } from '../organisms/Toast/Toast';
import type { ToastOptions } from '../hooks/ui/useToast';

export interface ToastContextValue {
  /** アプリ全体で共有する Toast を表示する */
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** Toast の角丸（テーマの形状設定を反映したい場合に渡す） */
  borderRadius?: string;
}

type ProviderToastState = ToastOptions & {
  isOpen: boolean;
  message: string;
};

/**
 * アプリ全体で 1 つの Toast を管理する Provider。
 *
 * コンポーネントローカルの useToast と違い、表示主体が Provider 側にあるため
 * ルート遷移（router.push 等）をまたいでも通知が消えない。保存成功 → 一覧へ
 * 遷移するようなフローの通知はこちらを使う。
 *
 * duration に既定値を注入しないのは意図的: 未指定のまま Toast へ渡すことで
 * 「error / warning は自動クローズしない・それ以外は 3000ms」という
 * Toast 側の既定挙動に委ねる。
 */
export const ToastProvider: FC<ToastProviderProps> = ({ children, borderRadius }) => {
  const [toastState, setToastState] = useState<ProviderToastState>({
    isOpen: false,
    message: '',
  });

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    setToastState({ isOpen: true, message, ...options });
  }, []);

  const closeToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast {...toastState} onClose={closeToast} borderRadius={borderRadius} />
    </ToastContext.Provider>
  );
};

/** ToastProvider 配下で共有 Toast を表示するためのフック */
export const useAppToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useAppToast must be used within <ToastProvider>');
  }
  return context;
};
