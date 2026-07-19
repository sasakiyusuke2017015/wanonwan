'use client'

import { ReactNode } from 'react';

import { useOperationLog } from '../../../infra/devtools';
import { Icon } from '../../atoms/Icon';
import { IconName } from '../../constants';
import { cn } from '../../utils/cn';

export interface MenuItemProps {
  icon?: ReactNode | IconName;
  label?: string;
  /** 右端に表示する補助テキスト / バッジ ("✓ 使用中" など) */
  trailing?: ReactNode;
  /** 現在の選択を示す。disabled かつ hover 無効になり、視覚的にハイライト */
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}

/**
 * メニューアイテムコンポーネント
 */
export function MenuItem({
  icon,
  label,
  trailing,
  active = false,
  disabled = false,
  onClick,
  onClose,
}: MenuItemProps) {
  const log = useOperationLog('MenuItem');

  // iconが文字列の場合はIconコンポーネントに変換
  const renderIcon = (iconProp?: ReactNode | IconName, size: number = 18) => {
    if (!iconProp) return null;
    if (typeof iconProp === 'string') {
      return <Icon name={iconProp as IconName} size={size} />;
    }
    return iconProp;
  };

  const handleClick = () => {
    if (disabled) return;
    log('click', { label });
    onClick?.();
    onClose?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-fluid-sm transition-colors duration-150',
        active
          ? 'bg-gray-50 text-gray-900 font-medium cursor-default'
          : 'text-gray-700 hover:bg-gray-100',
        disabled && !active && 'opacity-60 cursor-not-allowed hover:bg-transparent',
      )}
      data-component="menu-item"
      data-active={active ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
    >
      {icon && (
        <span className="flex-shrink-0 text-gray-500">{renderIcon(icon)}</span>
      )}
      <span className="flex-1">{label}</span>
      {trailing && <span className="flex-shrink-0 text-xs text-gray-500">{trailing}</span>}
    </button>
  );
}
