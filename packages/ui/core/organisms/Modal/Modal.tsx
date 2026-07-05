'use client'

import { FC, ReactNode, useEffect, useId } from 'react';

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

  return (
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        // 初期フォーカスは先頭のフォーカス可能要素 = ヘッダーの閉じるボタン。
        // フォーカス可能要素が無い環境（jsdom 等）はパネルへフォールバック。
        fallbackFocus: '[data-modal-panel]',
        // ESC / 背景クリックは既存の onClose 経路で処理する（trap 側と二重発火させない）。
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
          data-modal-panel
          className={styles.panel}
          style={{ maxWidth, borderRadius }}
        >
          <div className={styles.header}>
            <Text as="h3" size="lg" weight="bold" className={styles.title} id={titleId}>{title}</Text>
            <IconButton
              icon="x"
              size={20}
              label="閉じる"
              onClick={() => { log('close', { title, trigger: 'button' }); onClose(); }}
              className={styles.closeButton}
            />
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </FocusTrap>
  );
};

