'use client'

// src/components/common/molecules/Toast.tsx
import { FC, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { useOperationLog } from '../../../infra/devtools';
import { Button } from '../../molecules/Button';
import { Icon } from '../../atoms/Icon';


export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  duration?: number; // 自動で閉じるまでの時間(ms)、0で自動クローズ無効
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string;
}

/**
 * Toastコンポーネント
 * オーバーレイなしで画面隅に表示される通知
 * 成功メッセージなど、ユーザー操作をブロックしない通知に使用
 */
export const Toast: FC<ToastProps> = ({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration: durationProp,
  position = 'top-right',
  borderRadius = '0.5rem', // デフォルト値
}) => {
  // error/warning は自動消去しない（ユーザーが見逃すため）
  const duration = durationProp ?? (type === 'error' || type === 'warning' ? 0 : 3000);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const log = useOperationLog('Toast');

  // 表示アニメーション
  useEffect(() => {
    if (isOpen) {
      // 少し遅らせてアニメーションを有効化
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExiting(false);
    }
  }, [isOpen]);

  // 自動クローズ
  useEffect(() => {
    if (!isOpen || duration === 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  const handleClose = () => {
    log('close', { type, message });
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // アニメーション時間
  };

  if (!isOpen) return null;

  // タイプ別の設定
  const typeConfig = {
    info: {
      icon: 'info-circle',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-600',
    },
    warning: {
      icon: 'info-triangle',
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-600',
    },
    error: {
      icon: 'info-circle',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-600',
    },
    success: {
      icon: 'check-circle',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-600',
    },
  } as const;

  const config = typeConfig[type];

  // ポジション別のスタイル
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  // アニメーションの方向
  const getTransform = () => {
    if (isExiting || !isVisible) {
      if (position.includes('right')) return 'translateX(120%)';
      return 'translateX(-120%)';
    }
    return 'translateX(0)';
  };

  return createPortal(
    <div
      className={`fixed z-50 ${positionStyles[position]}`}
      style={{
        transform: getTransform(),
        transition: 'transform 300ms ease-in-out',
      }}
      data-component="toast"
      data-type={type}
      data-position={position}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 shadow-lg border ${config.bgColor} ${config.borderColor}`}
        style={{ borderRadius }}
      >
        <Icon name={config.icon} size={20} stroke="#ffffff" />
        <span className="text-white font-medium">{message}</span>
        <Button
          variant="ghost"
          size="small"
          onClick={handleClose}
          className="!p-1 !min-w-0 ml-2 text-white/80 hover:text-white hover:!bg-white/10"
          aria-label="閉じる"
          enableShimmer={false}
        >
          <Icon name={'x'} size={16} stroke="currentColor" />
        </Button>
      </div>
    </div>,
    document.body
  );
};

