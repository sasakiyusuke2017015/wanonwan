'use client'

/**
 * FloatingMenuButton コンポーネント
 * スマホ/デスクトップ共通のフローティングメニューボタン
 */
import React from 'react';

import { Icon } from '../../atoms/Icon';
import { useOperationLog } from '../../../infra/devtools';
import { cn } from '../../utils/cn';
import { LAYOUT_SIZES, type IconName } from '../../constants';

interface FloatingMenuButtonProps {
  /** メニューが開いているか */
  isOpen: boolean;
  /** トグル時のコールバック */
  onToggle: () => void;
  /** ボタンの位置 */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** 追加のクラス名 */
  className?: string;
  /** ボタンサイズ（px） */
  size?: number;
  /** X方向のオフセット（px） */
  offsetX?: number;
  /** Y方向のオフセット（px） */
  offsetY?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** ボーダー色 */
  borderColor?: string;
  /** テキスト/アイコン色 */
  color?: string;
  /** 開くアイコン名 */
  openIcon?: IconName;
  /** 閉じるアイコン名 */
  closeIcon?: IconName;
  /** 開くラベル（アクセシビリティ） */
  openLabel?: string;
  /** 閉じるラベル（アクセシビリティ） */
  closeLabel?: string;
}

/**
 * フローティングメニューボタン
 *
 * @example
 * ```tsx
 * <FloatingMenuButton
 *   isOpen={isMenuOpen}
 *   onToggle={() => setIsMenuOpen(!isMenuOpen)}
 *   backgroundColor="#065f46"
 *   borderColor="#047857"
 *   color="#ffffff"
 * />
 * ```
 */
export const FloatingMenuButton: React.FC<FloatingMenuButtonProps> = ({
  isOpen,
  onToggle,
  position = 'bottom-left',
  className = '',
  size = 24,
  offsetX = 0,
  offsetY = 0,
  backgroundColor = '#065f46',
  borderColor = '#047857',
  color = '#ffffff',
  openIcon = 'hamburger',
  closeIcon = 'x',
  openLabel = 'メニューを開く',
  closeLabel = 'メニューを閉じる',
}) => {
  const log = useOperationLog('FloatingMenuButton');

  const handleToggle = () => {
    log(isOpen ? 'close' : 'open', { position });
    onToggle();
  };
  // ボタンサイズとLeftPaneの中心を計算
  const buttonSize = size;
  const leftPaneCenter = LAYOUT_SIZES.LEFT_PANE_WIDTH / 2 - buttonSize / 2;

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': {
      left: `${leftPaneCenter + offsetX}px`,
      bottom: `${8 + offsetY}px`,
    },
    'bottom-right': {
      right: `${8 - offsetX}px`,
      bottom: `${8 + offsetY}px`,
    },
    'top-left': {
      left: `${leftPaneCenter + offsetX}px`,
      top: `${LAYOUT_SIZES.HEADER_HEIGHT + 8 + offsetY}px`,
    },
    'top-right': {
      right: `${8 - offsetX}px`,
      top: `${LAYOUT_SIZES.HEADER_HEIGHT + 8 + offsetY}px`,
    },
  };

  return (
    <button
      data-component="floating-menu-button"
      onClick={handleToggle}
      className={cn(
        'fixed group flex items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-opacity-30',
        className
      )}
      style={{
        ...positionStyles[position],
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        zIndex: 10000,
        backgroundColor,
        borderColor,
        color,
      }}
      aria-label={isOpen ? closeLabel : openLabel}
    >
      <div className="relative h-4 w-4">
        <div
          className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'rotate-180 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
        >
          <Icon
            name={openIcon}
            size={16}
            className="transition-transform duration-200 group-hover:scale-110"
          />
        </div>
        <div
          className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-75 opacity-0'}`}
        >
          <Icon
            name={closeIcon}
            size={16}
            className="transition-transform duration-200 group-hover:scale-110"
          />
        </div>
      </div>
    </button>
  );
};

