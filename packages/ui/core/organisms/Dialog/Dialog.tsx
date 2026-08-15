'use client'

/**
 * Dialog — 定型メッセージ型のオーバーレイ (`message: string` + ボタン)。
 *
 * 棲み分け (同じオーバーレイでもコンテンツ契約が別なら別 component):
 * - 確認 (確定/キャンセル) は `ConfirmDialog` 経由で使う (正準 API)
 * - 通知のみは `<Dialog variant="alert">` を直接使う
 * - 自由コンテンツ (children) の枠が必要なら `Modal` を使う
 */
import { FC, useEffect, useId } from 'react';

import { createPortal } from 'react-dom';
import { FocusTrap } from 'focus-trap-react';

import { Button } from '../../molecules/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { useOperationLog } from '../../../infra/devtools';
import { useBodyScrollLock } from '../../hooks/ui/useBodyScrollLock';


export type DialogType = 'info' | 'warning' | 'error' | 'success' | 'danger';

interface DialogBaseProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: DialogType;
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string;
}

interface AlertDialogProps extends DialogBaseProps {
  variant?: 'alert';
  onClose: () => void;
  confirmText?: string;
  // confirm用のpropsは不要
  onConfirm?: never;
  onCancel?: never;
  cancelText?: never;
}

interface ConfirmDialogProps extends DialogBaseProps {
  variant: 'confirm';
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  // alert用のpropsは不要
  onClose?: never;
}

export type DialogProps = AlertDialogProps | ConfirmDialogProps;

// タイプ別のアイコンと色設定
const typeConfig = {
  info: {
    icon: 'info-circle',
    iconColor: 'text-blue-500',
    headerBg: 'bg-blue-50',
  },
  warning: {
    icon: 'info-triangle',
    iconColor: 'text-yellow-500',
    headerBg: 'bg-yellow-50',
  },
  error: {
    icon: 'x-circle',
    iconColor: 'text-red-500',
    headerBg: 'bg-red-50',
  },
  success: {
    icon: 'check-circle',
    iconColor: 'text-green-500',
    headerBg: 'bg-green-50',
  },
  danger: {
    icon: 'info-triangle',
    iconColor: 'text-red-500',
    headerBg: 'bg-red-50',
  },
} as const;

/**
 * 汎用ダイアログコンポーネント
 * variant='alert': window.alertの代替（OKボタンのみ）
 * variant='confirm': window.confirmの代替（キャンセル+確定ボタン）
 *
 * a11y:
 * - role="dialog" + aria-modal="true" で modal として SR に認識される
 * - aria-labelledby (title あり時) / aria-label (title なし時) でラベル付与
 * - aria-describedby で message を SR に読み上げ
 * - focus-trap-react で modal 内に focus を閉じ込め
 * - type="danger" 時は cancel ボタンに初期 focus (誤確定防止)
 * - 閉じた後は trigger 要素に focus 復帰 (FocusTrap デフォルト)
 * - backdrop からは role="button" を削除 (W3C 準拠)。aria-hidden は付与しない
 *   (modal 本体が backdrop の子のため、付与すると a11y tree から modal も消える)
 */
export const Dialog: FC<DialogProps> = (props) => {
  const {
    isOpen,
    title,
    message,
    type = 'info',
    variant = 'alert',
    borderRadius = '0.5rem', // デフォルト値
  } = props;

  const log = useOperationLog('Dialog');
  const isConfirm = variant === 'confirm';
  const titleId = useId();
  const messageId = useId();

  useBodyScrollLock(isOpen);

  // ダイアログの開閉をログ
  useEffect(() => {
    if (isOpen) {
      log('open', { variant, type, title });
    }
  }, [isOpen, variant, type, title, log]);

  // 閉じる処理
  const handleClose = (trigger: string = 'cancel') => {
    log('close', { variant, type, title, trigger });
    if (isConfirm) {
      (props as ConfirmDialogProps).onCancel();
    } else {
      (props as AlertDialogProps).onClose();
    }
  };

  // 確定処理
  const handleConfirm = () => {
    log('confirm', { variant, type, title });
    if (isConfirm) {
      (props as ConfirmDialogProps).onConfirm();
    } else {
      (props as AlertDialogProps).onClose();
    }
  };

  // キーボードイベント (ESC + Enter for alert)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose('escape');
      }
      // alertの場合のみEnterで閉じる
      if (!isConfirm && event.key === 'Enter') {
        handleClose('enter');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirm]);

  if (!isOpen) return null;

  const config = typeConfig[type];
  const confirmText = props.confirmText || (isConfirm ? '確定' : '閉じる');
  const cancelText = isConfirm ? ((props as ConfirmDialogProps).cancelText || 'キャンセル') : undefined;

  // 背景クリックで閉じる
  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose('backdrop');
    }
  };

  // type="danger" の confirm dialog は誤確定防止のため cancel ボタンに初期 focus
  // (Button は forwardRef 未対応のため CSS selector 方式で指定)
  const initialFocusSelector =
    isConfirm && type === 'danger' ? '[data-dialog-cancel]' : undefined;

  return createPortal(
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        ...(initialFocusSelector ? { initialFocus: initialFocusSelector } : {}),
        // jsdom で focusable element が見つからない場合のフォールバック
        fallbackFocus: '[role="dialog"]',
        escapeDeactivates: false, // ESC は上の useEffect で handleClose を呼ぶため二重発火を防ぐ
        clickOutsideDeactivates: false, // 背景クリックも上の handleBackgroundClick で処理
      }}
    >
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/30"
        style={{ zIndex: 10000 }}
        onClick={handleBackgroundClick}
        data-component="dialog"
        data-variant={variant}
        data-type={type}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={!title ? message : undefined}
          aria-describedby={messageId}
          className="bg-white shadow-xl"
          style={{ borderRadius, width: 480, maxWidth: '90%' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          {title && (
            <div className={`flex items-center gap-3 px-6 py-4 ${config.headerBg}`}>
              <Icon name={config.icon} size={24} className={config.iconColor} />
              <Text as="h3" size="lg" weight="bold" className="text-gray-800" id={titleId}>{title}</Text>
            </div>
          )}

          {/* メッセージ */}
          <div className="px-6 py-4">
            {!title && (
              <div className="mb-3 flex justify-center">
                <Icon name={config.icon} size={48} className={config.iconColor} />
              </div>
            )}
            <Text as="p" className="whitespace-pre-wrap text-gray-700" id={messageId}>{message}</Text>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-2 px-6 py-4">
            {isConfirm && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleClose('button')}
                data-dialog-cancel
              >
                {cancelText}
              </Button>
            )}
            <Button
              variant={type === 'danger' ? 'danger' : 'primary'}
              size="small"
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
};
