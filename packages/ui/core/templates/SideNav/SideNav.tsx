import React from 'react';

import styles from './SideNav.module.scss';

export interface SideNavProps {
  /** サイドナビの幅（px） */
  width: number;
  /** ヘッダーからのオフセット（px） */
  topOffset: number;
  /** 開閉状態 */
  isOpen?: boolean;
  /** 背景色 */
  bgColor?: string;
  /** ナビゲーションアイテム */
  children?: React.ReactNode;
  /** 追加の className */
  className?: string;
  /** 追加のスタイル */
  style?: React.CSSProperties;
}

/**
 * 汎用サイドナビコンポーネント
 *
 * 固定位置で画面左側に表示されるサイドナビゲーション。
 * isOpen で開閉状態を制御可能。
 */
export function SideNav({
  width,
  topOffset,
  isOpen = true,
  bgColor,
  children,
  className,
  style,
}: SideNavProps) {
  const sideNavClasses = [styles.sideNav, className].filter(Boolean).join(' ');

  return (
    <div
      className={sideNavClasses}
      style={{
        width: `${width}px`,
        top: `${topOffset}px`,
        left: isOpen ? 0 : `-${width}px`,
        backgroundColor: bgColor,
        ...style,
      }}
      data-component="SideNav"
    >
      {/* コンテンツエリア */}
      <div className={styles.sideNav__content}>
        {children}
      </div>
    </div>
  );
}

