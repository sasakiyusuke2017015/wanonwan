'use client'

import { ReactNode } from 'react';

import { useOperationLog } from '../../../infra/devtools';
import { Icon } from '../../atoms/Icon';
import { IconName } from '../../constants';

export interface MenuItemProps {
  icon?: ReactNode | IconName;
  label?: string;
  onClick?: () => void;
  onClose?: () => void;
}

/**
 * メニューアイテムコンポーネント
 */
export function MenuItem({
  icon,
  label,
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
    log('click', { label });
    onClick?.();
    onClose?.();
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-fluid-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100"
      data-component="menu-item"
    >
      {icon && (
        <span className="flex-shrink-0 text-gray-500">{renderIcon(icon)}</span>
      )}
      <span className="flex-1">{label}</span>
    </button>
  );
}
