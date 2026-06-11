'use client'

import { FC } from 'react';

import { type IconName } from '../../constants';

import { Button } from '../Button';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'default' | 'success';
type ButtonSize = 'small' | 'medium' | 'large';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: IconName;
}

/**
 * 戻るボタンコンポーネント
 * 統一されたデザインの戻るボタン
 */
export const BackButton: FC<BackButtonProps> = ({
  onClick,
  label = '戻る',
  disabled = false,
  variant = 'secondary',
  size = 'small',
  className,
  icon = 'arrow-u-turn',
}) => {
  return (
    <span data-component="back-button">
      <Button
        variant={variant}
        size={size}
        leftIcon={icon}
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {label}
      </Button>
    </span>
  );
};
