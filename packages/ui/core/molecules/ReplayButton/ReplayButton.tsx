'use client'

import { FC } from 'react';

import { Button } from '../Button';


interface ReplayButtonProps {
  onClick: () => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'default' | 'success';
}

/**
 * 再生ボタン
 * アニメーション再生やコンポーネント再マウントのトリガーとして使用
 */
export const ReplayButton: FC<ReplayButtonProps> = ({
  onClick,
  label = '再生',
  size = 'small',
  variant = 'outline',
}) => (
  <span data-component="replay-button">
    <Button
      size={size}
      variant={variant}
      leftIcon={'arrow-rotate'}
      onClick={onClick}
    >
      {label}
    </Button>
  </span>
);
