'use client'

// src/components/common/atoms/Banner.tsx
import { type ReactNode, useEffect } from 'react';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import type { IconName } from '../../constants';
import { debugRender } from '../../utils/debug';
import styles from './Banner.module.scss';

export type BannerVariant = 'info' | 'warning' | 'success' | 'error';

interface BannerProps {
  /** バナーの種類 */
  variant: BannerVariant;
  /** タイトル（省略可） */
  title?: string;
  /** メッセージ（文字列または ReactNode） */
  message: string | ReactNode;
  /** アイコンを表示するか（デフォルト: true） */
  showIcon?: boolean;
  /** カスタムアイコン名（省略時は variant に応じたデフォルト） */
  icon?: IconName;
  /** 追加のクラス名 */
  className?: string;
}

// バリアントごとのデフォルトアイコン
const defaultIcons: Record<BannerVariant, IconName> = {
  info: 'info-circle',
  warning: 'info-triangle',
  success: 'check-circle',
  error: 'x-circle',
};

/**
 * 汎用バナーコンポーネント
 *
 * @example
 * // シンプルなエラーバナー
 * <Banner variant="error" message="保存に失敗しました。時間をおいて再度お試しください。" />
 *
 * // タイトル付き
 * <Banner variant="warning" title="注意" message="この操作は取り消せません" />
 *
 * // アイコンなし
 * <Banner variant="info" message="お知らせ" showIcon={false} />
 */
export function Banner({
  variant,
  title,
  message,
  showIcon = true,
  icon,
  className,
}: BannerProps) {
  // マウント時のログ
  useEffect(() => {
    debugRender('Banner', { variant, title, showIcon });
  }, []);

  const iconName = icon ?? defaultIcons[variant];
  const bannerClasses = [
    styles.banner,
    styles[`banner--${variant}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={bannerClasses}
      data-component="Banner"
      data-variant={variant}
    >
      <div className={styles.banner__content}>
        {showIcon && (
          <div className={styles.banner__icon}>
            <Icon
              name={iconName}
              size={20}
              fill="var(--banner-icon-color)"
              stroke="var(--banner-icon-color)"
            />
          </div>
        )}
        <div className={styles.banner__body}>
          {title && (
            <Text as="p" weight="semibold" className={styles.banner__title}>
              {title}
            </Text>
          )}
          <div className={styles.banner__message}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
