'use client'

import React, { forwardRef } from 'react';

interface ResponsiveContainerProps {
  heightPercent?: number;
  className?: string;
  enableKeyboardNav?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
  showDebugInfo?: boolean;
  /** スクロール設定 */
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll';
  children: React.ReactNode;
}

export const ResponsiveContainer = forwardRef<
  HTMLDivElement,
  ResponsiveContainerProps
>(
  (
    {
      heightPercent = 60,
      className = '',
      enableKeyboardNav = false,
      onKeyDown,
      tabIndex,
      showDebugInfo = false,
      overflow,
      children,
    },
    ref
  ) => {
    const containerStyle: React.CSSProperties = {
      height: `${heightPercent}vh`,
      maxHeight: `${heightPercent}vh`,
      minHeight: `${heightPercent}vh`,
      flexShrink: 0, // Flexアイテムとして縮小されないように
      boxSizing: 'border-box', // ボーダーとパディングを含む正確なサイズ計算
      position: 'relative', // 親要素のレイアウトから独立
      overflow, // スクロール設定
    };

    return (
      <div
        ref={ref}
        className={className}
        style={containerStyle}
        tabIndex={enableKeyboardNav ? (tabIndex ?? 0) : undefined}
        onKeyDown={enableKeyboardNav ? onKeyDown : undefined}
        role={enableKeyboardNav ? 'region' : undefined}
        aria-label={enableKeyboardNav ? 'Responsive container' : undefined}
        data-component="responsive-container"
      >
        {showDebugInfo && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'rgba(255,0,0,0.8)',
              color: 'white',
              padding: '4px 8px',
              fontSize: '12px',
              zIndex: 1000,
            }}
          >
            {heightPercent}vh (
            {Math.round((window.innerHeight * heightPercent) / 100)}px)
          </div>
        )}
        {children}
      </div>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';
