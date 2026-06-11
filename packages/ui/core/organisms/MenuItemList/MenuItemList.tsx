'use client'

import { FC, ReactNode, Children, cloneElement, isValidElement, ReactElement } from 'react';

import { IconName } from '../../constants';
import { MenuItem } from '../../molecules/MenuItem/MenuItem';

import styles from './MenuItemList.module.scss';

export interface MenuItemData {
  icon?: ReactNode | IconName;
  label?: string;
  onClick?: () => void;
}

interface MenuItemListProps {
  menuHeader?: ReactNode;
  menuItems?: MenuItemData[]; // 後方互換性のため
  children?: ReactNode; // 新しい方法: MenuItemList.Item を使用
  onClose?: () => void;
}

interface MenuItemListItemProps {
  children: ReactNode;
  onClick?: () => void;
  index?: number;
  preventClose?: boolean;
}

const MenuItemListItem: FC<MenuItemListItemProps> = ({
  children,
  onClick,
  index = 0,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={styles.menuItemListItem}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={0}
      data-component="MenuItemListItem"
    >
      {children}
    </div>
  );
};

interface MenuItemListComponent extends FC<MenuItemListProps> {
  Item: typeof MenuItemListItem;
}

/**
 * メニューアイテムリストコンポーネント
 * DropdownMenu内で表示されるヘッダーとメニューアイテムのリストを管理
 */
const MenuItemListBase: FC<MenuItemListProps> = ({
  menuHeader,
  menuItems,
  children,
  onClose,
}) => {
  // 子要素にindexを自動付与
  const processedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child) && child.type === MenuItemListItem) {
      const childElement = child as ReactElement<MenuItemListItemProps>;
      const originalOnClick = childElement.props.onClick;
      const preventClose = childElement.props.preventClose;
      return cloneElement(childElement, {
        index,
        onClick: () => {
          if (originalOnClick) {
            originalOnClick();
          }
          // preventCloseがtrueの場合はメニューを閉じない
          if (onClose && !preventClose) {
            onClose();
          }
        }
      });
    }
    return child;
  });

  return (
    <div data-component="MenuItemList">
      {/* ヘッダー部分 */}
      {menuHeader && (
        <div className={styles.menuItemList__header}>{menuHeader}</div>
      )}

      {/* メニューアイテム（新しい方法: children） */}
      {children && <div className={styles.menuItemList__items}>{processedChildren}</div>}

      {/* メニューアイテム（古い方法: menuItems配列、後方互換性） */}
      {menuItems && menuItems.length > 0 && (
        <div className={styles.menuItemList__items}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Compound Component パターン
const MenuItemListWithItem = MenuItemListBase as MenuItemListComponent;
MenuItemListWithItem.Item = MenuItemListItem;

export const MenuItemList = MenuItemListWithItem;
