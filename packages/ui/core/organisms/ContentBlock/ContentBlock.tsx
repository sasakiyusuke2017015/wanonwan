import React from 'react';

import { Icon } from '../../atoms/Icon';
import { Media } from '../../atoms/Media/Media';
import { Text } from '../../atoms/Text';
import { LoadingZone } from '../LoadingZone/LoadingZone';
import { type IconName } from '../../constants';
import type { LoadingPreset } from '../../atoms/Icon';

export type IconType = 'none' | 'icon' | 'media';

interface ContentBlockProps {
  // タイトル関連
  title?: string | React.ReactNode;
  titleColor?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titleClassName?: string;

  // アイコン/メディア関連
  iconType?: IconType;
  iconName?: IconName;
  logoSrc?: string;
  logoAlt?: string;
  size?: number;
  width?: number;
  height?: number;

  // ローディング関連
  loading?: boolean;
  loadingMessage?: string;
  loadingHeight?: string;
  loadingPreset?: LoadingPreset;
  loadingSize?: number;
  loadingColor?: string;
  loadingFill?: string;

  // その他
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: 'card' | 'section';
  enableHoverAnimation?: boolean;
  hoverScale?: '100' | '105' | '110' | 'none';
  /** カードの角丸 - Layout から props で渡す */
  cardRadius?: string;
}

/**
 * LoadingZone対応の再利用可能なコンテンツブロックコンポーネント
 * ホーム画面のカードと詳細ページのコンテンツブロックの両方で使用可能
 */
export const ContentBlock: React.FC<ContentBlockProps> = ({
  // タイトル関連
  title,
  titleColor = 'text-gray-800',
  titleAlign = 'left',
  titleClassName = '',

  // アイコン/メディア関連
  iconType = 'none',
  iconName = 'person',
  logoSrc,
  logoAlt = 'Logo',
  size = 48,
  width,
  height,

  // ローディング関連
  loading = false,
  loadingMessage = '読み込み中...',
  loadingHeight = '200px',
  loadingPreset = 'spinner',
  loadingSize = 32,
  loadingColor = 'text-indigo-600',
  loadingFill,

  // その他
  children,
  className = '',
  id,
  variant = 'card',
  enableHoverAnimation,
  hoverScale = '105',
  cardRadius = '0.5rem', // デフォルト値
}) => {
  // サイズ計算ロジック
  const finalWidth = width || size;
  const finalHeight = height || size;

  // variant に応じた enableHoverAnimation のデフォルト値
  // 明示的に指定された場合はそれを優先
  const shouldEnableHoverAnimation =
    enableHoverAnimation ?? (variant === 'card');

  // タイトル配置のクラス
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[titleAlign];

  // variant に応じたベーススタイル（rounded-* は style で適用）
  const baseClass = {
    card: 'w-full border border-gray-200/30 bg-white/80 p-6 shadow-lg backdrop-blur-sm hover:border-blue-300/50',
    section: 'bg-white p-6 shadow-md',
  }[variant];

  // ホバースケールのクラス
  const scaleClass = {
    '100': 'hover:scale-100',
    '105': 'hover:scale-105',
    '110': 'hover:scale-110',
    none: '',
  }[hoverScale];

  // ホバーアニメーションのクラス
  const hoverAnimationClass = shouldEnableHoverAnimation
    ? `transition-all duration-300 ${scaleClass} hover:shadow-2xl`
    : '';

  // 最終的な className を組み立て
  const finalClassName = `${baseClass} ${hoverAnimationClass} ${className}`.trim();

  return (
    <LoadingZone
      loading={loading}
      variant="simple"
      height={loadingHeight}
      message={loadingMessage}
      preset={loadingPreset}
      size={loadingSize}
      color={loadingColor}
      fill={loadingFill}
    >
      <div id={id} className={finalClassName} style={{ borderRadius: cardRadius }} data-component="content-block" data-variant={variant}>
        {/* アイコン/メディア表示 */}
        {iconType !== 'none' && (
          <div className="mb-3 flex justify-center">
            {iconType === 'icon' ? (
              <Icon
                name={iconName}
                size={finalWidth}
                className="text-gray-600"
              />
            ) : iconType === 'media' ? (
              <Media
                src={logoSrc || '/images/favicon.svg'}
                alt={logoAlt}
                width={finalWidth}
                height={finalHeight}
                fallbackSrc="/images/favicon.svg"
              />
            ) : null}
          </div>
        )}

        {/* タイトル */}
        {title && (
          <Text
            as="h3"
            size="lg"
            weight="semibold"
            className={`mb-4 ${titleColor} ${alignClass} ${titleClassName}`}
          >
            {title}
          </Text>
        )}

        {/* 子要素 */}
        <div className={iconType !== 'none' ? 'space-y-3' : ''}>{children}</div>
      </div>
    </LoadingZone>
  );
};
