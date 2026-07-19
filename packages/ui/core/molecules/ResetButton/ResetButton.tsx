'use client'

import { FC } from 'react';



import { Button } from '../Button';

interface ResetButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  /** スクリーンリーダー向けの名称 (未指定時は label が読まれる) */
  ariaLabel?: string;
}

/**
 * リセットボタンコンポーネント
 * 統一されたデザインのリセットボタン
 */
export const ResetButton: FC<ResetButtonProps> = ({
  onClick,
  label = 'リセット',
  disabled = false,
  ariaLabel,
}) => {
  return (
    <span data-component="reset-button">
      <Button
        variant="danger"
        size="small"
        leftIcon={'arrow-rotate'}
        onClick={onClick}
        enableHopEffect={false}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {label}
      </Button>
    </span>
  );
};
