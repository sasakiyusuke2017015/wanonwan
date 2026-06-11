import React from 'react';

import styles from './SubHeader.module.scss';

export interface SubHeaderProps {
  /** ヘッダーからのオフセット（px） */
  topOffset: number;
  /** 左からのオフセット（SideNav の幅など） */
  leftOffset?: number;
  /** サブヘッダーのコンテンツ */
  children?: React.ReactNode;
  /** 追加の className */
  className?: string;
  /** 追加のスタイル */
  style?: React.CSSProperties;
  /** DOM参照用のref */
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * 汎用サブヘッダーコンポーネント
 *
 * Header の下に固定位置で表示されるサブヘッダー。
 * タブやフィルター、追加のコントロールなどを配置可能。
 */
export function SubHeader({
  topOffset,
  leftOffset = 0,
  children,
  className,
  style,
  innerRef,
}: SubHeaderProps) {
  const subHeaderClasses = [styles.subHeader, className].filter(Boolean).join(' ');

  return (
    <div
      ref={innerRef}
      className={subHeaderClasses}
      style={{
        top: `${topOffset}px`,
        left: `${leftOffset}px`,
        ...style,
      }}
      data-component="SubHeader"
    >
      {children}
    </div>
  );
}

