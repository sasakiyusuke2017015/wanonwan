import React from 'react';

import styles from './Header.module.scss';

export interface HeaderProps {
  /** ヘッダーの高さ（px） */
  height: number;
  /** 背景色 */
  bgColor?: string;
  /** テキスト色 */
  textColor?: string;
  /** 下部ボーダー色 */
  borderColor?: string;
  /** 左側コンテンツ（ロゴ、パンくずリストなど） */
  leftContent?: React.ReactNode;
  /** 中央コンテンツ */
  centerContent?: React.ReactNode;
  /** 右側コンテンツ（ユーザーメニューなど） */
  rightContent?: React.ReactNode;
  /** 追加の className */
  className?: string;
  /** 追加のスタイル */
  style?: React.CSSProperties;
}

/**
 * 汎用ヘッダーコンポーネント
 *
 * 固定位置で画面上部に表示されるヘッダー。
 * スロット式で左・中央・右のコンテンツを自由に配置可能。
 */
export function Header({
  height,
  bgColor,
  textColor,
  borderColor,
  leftContent,
  centerContent,
  rightContent,
  className,
  style,
}: HeaderProps) {
  const headerClasses = [styles.header, className].filter(Boolean).join(' ');

  return (
    <header
      className={headerClasses}
      style={{
        height: `${height}px`,
        backgroundColor: bgColor,
        color: textColor,
        borderBottom: borderColor ? `3px solid ${borderColor}` : undefined,
        ...style,
      }}
      data-component="Header"
    >
      <div className={styles.header__inner}>
        <div className={styles.header__content}>
          {/* 左コンテンツ */}
          {leftContent}

          {/* 中央コンテンツ */}
          {centerContent}

          {/* 右コンテンツ */}
          {rightContent}
        </div>
      </div>
    </header>
  );
}

