import React from 'react';

import styles from './Footer.module.scss';

export interface FooterProps {
  /** フッターの高さ（px） */
  height: number;
  /** 下からのオフセット（BottomTabBar などがある場合） */
  bottomOffset?: number;
  /** 左からのオフセット（SideNav の幅など） */
  leftOffset?: number;
  /** フッターコンテンツ */
  children?: React.ReactNode;
  /** 追加の className */
  className?: string;
  /** 追加のスタイル */
  style?: React.CSSProperties;
}

/**
 * 汎用フッターコンポーネント
 *
 * 固定位置で画面下部に表示されるフッター。
 * leftOffset / bottomOffset で SideNav や BottomTabBar との連携が可能。
 */
export function Footer({
  height,
  bottomOffset = 0,
  leftOffset = 0,
  children,
  className,
  style,
}: FooterProps) {
  if (!children) return null;

  const footerClasses = [styles.footer, className].filter(Boolean).join(' ');

  return (
    <footer
      className={footerClasses}
      style={{
        height: `${height}px`,
        bottom: `${bottomOffset}px`,
        left: `${leftOffset}px`,
        ...style,
      }}
      data-component="Footer"
    >
      {children}
    </footer>
  );
}

