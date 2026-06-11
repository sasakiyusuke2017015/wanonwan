'use client'

import { FC, ReactNode, useEffect } from 'react';

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
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-component="modal"
    >
      <div
        className={styles.panel}
        style={{ maxWidth, borderRadius }}
      >
        <div className={styles.header}>
          <Text as="h3" size="lg" weight="bold" className={styles.title}>{title}</Text>
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
  );
};

