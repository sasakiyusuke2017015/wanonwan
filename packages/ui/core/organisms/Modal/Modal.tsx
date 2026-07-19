'use client'

import { FC, ReactNode, useEffect, useId } from 'react';

import { createPortal } from 'react-dom';
import { FocusTrap } from 'focus-trap-react';

import { IconButton } from '../../molecules/IconButton';
import { Text } from '../../atoms/Text';
import { useOperationLog } from '../../../infra/devtools';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  borderRadius?: string;
}

/**
 * 汎用モーダルコンポーネント (title + children を持つ generic modal)。
 *
 * 棲み分け: 自由コンテンツの枠が必要なときに使う。定型メッセージの
 * 確認/通知は ConfirmDialog / Dialog を使う (Dialog.tsx の doc 参照)。
 *
 * a11y:
 * - createPortal で document.body 直下に描画 (Dialog と同様)
 * - role="dialog" + aria-modal="true" で modal として SR に認識される
 * - aria-labelledby で title を SR に読み上げ
 * - focus-trap-react で modal 内に focus を閉じ込め (close button が初期 focus)
 * - 閉じた後は trigger 要素に focus 復帰 (FocusTrap デフォルト)
 */
export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '28rem',
  borderRadius = '16px',
}) => {
  const log = useOperationLog('Modal');
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      log('open', { title });
    }
  }, [isOpen, title, log]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        log('close', { title, trigger: 'escape' });
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, title, log]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      log('close', { title, trigger: 'backdrop' });
      onClose();
    }
  };

  return createPortal(
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        // 初期フォーカスはパネル自体に置く。先頭 tabbable (閉じるボタン) に置くと
        // focus-within 発火のツールチップが開いた瞬間から表示されてしまう
        initialFocus: '[role="dialog"]',
        fallbackFocus: '[role="dialog"]',
        escapeDeactivates: false,
        clickOutsideDeactivates: false,
      }}
    >
      <div
        className={styles.backdrop}
        onClick={handleBackdropClick}
        data-component="modal"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={styles.panel}
          style={{ maxWidth, borderRadius }}
        >
          <div className={styles.header}>
            <Text as="h3" size="lg" weight="bold" className={styles.title} id={titleId}>{title}</Text>
            <IconButton
              icon="x"
              size={20}
              label="閉じる"
              // パネルが overflow: hidden のため上向きツールチップは天面で見切れて
              // 黒い塊に見える。パネル内側 (ボタン左下) に出す
              tooltipPosition="bottom-end"
              onClick={() => { log('close', { title, trigger: 'button' }); onClose(); }}
              className={styles.closeButton}
            />
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
};
