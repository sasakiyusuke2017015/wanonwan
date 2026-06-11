'use client'

/**
 * 固定位置タブバーコンポーネント
 * SubHeaderと同じ位置に固定表示されるタブバー
 */
import { FC, useEffect, useRef, ReactNode } from 'react';

import { LAYOUT_SIZES } from '../../constants';

interface FixedTabBarProps {
  /** タブバーコンテンツ */
  children: ReactNode;
  /** 左ペインが開いているか */
  isLeftPaneOpen: boolean;
  /** カスタムクラス名 */
  className?: string;
  /** タブボーダー角丸 - Layout から props で渡す */
  tabBorderRadius?: string;
}

/**
 * 固定位置タブバーコンポーネント
 * SubHeaderと同じ位置に固定表示
 */
export const FixedTabBar: FC<FixedTabBarProps> = ({
  children,
  isLeftPaneOpen,
  className = '',
  tabBorderRadius = '0.5rem', // デフォルト値
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // タブバーの高さをCSS変数として設定
  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--subheader-height', `${height}px`);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={`fixed right-0 z-20 border-b border-gray-200 shadow-sm ${className}`}
      data-component="fixed-tab-bar"
      style={{
        top: `${LAYOUT_SIZES.HEADER_HEIGHT}px`,
        left: isLeftPaneOpen ? `${LAYOUT_SIZES.LEFT_PANE_WIDTH}px` : '0px',
        transition: 'left 300ms ease-in-out',
        borderBottomLeftRadius: tabBorderRadius,
      }}
    >
      {children}
    </div>
  );
};

