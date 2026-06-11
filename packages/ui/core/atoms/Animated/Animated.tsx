import React from 'react';

import { motion } from 'framer-motion';

import {
  ANIMATIONS,
  AnimationConfig,
  type CardAnimationVariant,
  type TableRowAnimationVariant,
  type DropMenuAnimationVariant,
} from '../../constants';

// アニメーションカテゴリ（animations.ts の構造と対応）
export type AnimationCategory = 'framer' | 'card' | 'tableRow' | 'dropMenu';

// Framer Motion のバリアント
export type FramerAnimationVariant = 'collapse' | 'fade' | 'slide' | 'scale' | 'rotate';

// シンプルな type API（基本的なアニメーション用）
export type AnimationType = 'collapse' | 'fade' | 'slide' | 'scale' | 'slideRight' | 'slideDown' | 'rotate';

export type SlideDirection = 'left' | 'right' | 'up' | 'down';

export interface AnimatedProps {
  /** 表示状態 */
  show: boolean;

  // API 1: category + variant（animations.ts の全バリアントに対応）
  /** アニメーションカテゴリ（framer, card, tableRow, dropMenu） */
  category?: AnimationCategory;
  /** アニメーションバリアント（カテゴリごとに異なる） */
  variant?: string;

  // API 2: type（シンプルな基本アニメーション用）
  /** アニメーションタイプ（基本的なアニメーション用のシンプルAPI） */
  type?: AnimationType;

  /** アニメーション継続時間（秒） */
  duration?: number;
  /** アニメーション遅延時間（秒） */
  delay?: number;
  /** スライド方向（type="slide"の場合のみ） */
  slideDirection?: SlideDirection;
  /** collapse時の最大高さ（px） */
  maxHeight?: number;
  /** collapse時のpadding（showがtrueの時の値） */
  padding?: string | number;
  /** CSS keyframes使用時のインデックス（遅延計算用） */
  index?: number;
  /** CSS keyframes使用時の速度倍率 */
  speed?: number;
  /** カスタムクラス名 */
  className?: string;
  /** rotate時の回転角度（度）、デフォルト: 180 */
  rotateDegree?: number;
  /** rotate時のスケール変化（show=true時のスケール）、デフォルト: 1.1 */
  rotateScale?: number;
  /** 子要素 */
  children: React.ReactNode;
}

/**
 * type API から category + variant に変換
 */
function getCategory(type: AnimationType): AnimationCategory {
  if (type === 'slideRight' || type === 'slideDown') return 'card';
  return 'framer';
}

function getVariant(type: AnimationType): string {
  switch (type) {
    case 'slideRight': return 'slideRight';
    case 'slideDown': return 'slideDown';
    case 'collapse': return 'collapse';
    case 'fade': return 'fade';
    case 'slide': return 'slide';
    case 'scale': return 'scale';
    case 'rotate': return 'rotate';
    default: return 'fade';
  }
}

/**
 * category + variant から AnimationConfig を取得
 * 注: 'none' variant は呼び出し元でフィルタリングすること
 */
function getConfigForCategoryVariant(category: AnimationCategory, variant: string): AnimationConfig {
  // 'none' は ANIMATIONS に存在しないため、呼び出し元でチェックが必要
  if (variant === 'none') {
    throw new Error('Variant "none" is not supported. Filter it before calling this function.');
  }
  switch (category) {
    case 'card':
      return ANIMATIONS.card[variant as Exclude<CardAnimationVariant, 'none'>];
    case 'tableRow':
      return ANIMATIONS.tableRow[variant as Exclude<TableRowAnimationVariant, 'none'>];
    case 'dropMenu':
      return ANIMATIONS.dropMenu[variant as Exclude<DropMenuAnimationVariant, 'none'>];
    case 'framer':
      return ANIMATIONS.framer[variant as FramerAnimationVariant];
    default:
      throw new Error(`Unsupported category: ${category}`);
  }
}

/**
 * Animated
 *
 * 汎用アニメーションコンポーネント。
 * 複数のアニメーションパターンをサポート。
 *
 * @example
 * // API 1: category + variant（animations.ts の全バリアントに対応）
 * <Animated category="card" variant="slideRight" show={true} index={0}>
 * <Animated category="card" variant="slideRightFast" show={true} index={0}>
 * <Animated category="tableRow" variant="slideDownFast" show={true} index={0}>
 * <Animated category="framer" variant="fade" show={true}>
 *
 * // API 2: type（基本的なアニメーション用のシンプルAPI）
 * <Animated type="fade" show={true}>
 * <Animated type="slideRight" show={true} index={0}>
 */
export const Animated: React.FC<AnimatedProps> = ({
  show,
  category,
  variant,
  type,
  duration,
  delay,
  slideDirection = 'left',
  maxHeight,
  padding,
  index = 0,
  speed = 1.0,
  className = '',
  rotateDegree = 180,
  rotateScale = 1.1,
  children,
}) => {
  // type API から category + variant に変換
  const resolvedCategory = category ?? (type ? getCategory(type) : 'framer');
  const resolvedVariant = variant ?? (type ? getVariant(type) : 'fade');

  // CSS keyframes を使うかどうか
  const useCSSKeyframes = resolvedCategory === 'card' || resolvedCategory === 'tableRow' || resolvedCategory === 'dropMenu';

  if (useCSSKeyframes) {
    // animations.ts から設定を取得（category + variant で）
    const config = getConfigForCategoryVariant(resolvedCategory, resolvedVariant);

    const adjustedDuration = config.duration / speed;
    const adjustedDelay = (index * config.delay) / speed;

    return (
      <div
        className={className}
        data-component="animated"
        data-animation-category={resolvedCategory}
        data-animation-variant={resolvedVariant}
        style={{
          animation: `${config.name} ${adjustedDuration}ms ${config.easing} forwards`,
          animationDelay: `${adjustedDelay}ms`,
          opacity: 0, // 初期状態
        }}
      >
        {children}
      </div>
    );
  }

  // Framer Motion を使うタイプ
  // animations.ts から設定を取得（category + variant で）
  const animConfig = getConfigForCategoryVariant(resolvedCategory, resolvedVariant);

  // props で上書きされた値、または animConfig のデフォルト値を使用
  const finalDuration = duration ?? animConfig.framerDuration ?? animConfig.duration / 1000;
  const finalDelay = delay ?? animConfig.framerDelay ?? animConfig.delay / 1000;
  const finalMaxHeight = maxHeight ?? animConfig.maxHeight ?? 500;

  const getAnimationConfig = () => {
    switch (resolvedVariant) {

      case 'collapse': {
        const animateProps: Record<string, string | number> = {
          maxHeight: show ? finalMaxHeight : 0,
          opacity: show ? 1 : 0,
          overflow: show ? 'visible' : 'hidden',
        };

        if (padding !== undefined) {
          animateProps.padding = show ? (typeof padding === 'string' ? padding : padding) : 0;
        }

        return {
          initial: { maxHeight: 0, opacity: 0, overflow: 'hidden', ...(padding !== undefined ? { padding: 0 } : {}) },
          animate: animateProps,
          transition: {
            maxHeight: {
              duration: finalDuration,
              ease: 'easeInOut' as const,
            },
            opacity: {
              duration: finalDuration * 0.6,
              delay: show ? finalDuration : 0,
              ease: 'easeInOut' as const,
            },
            overflow: {
              delay: show ? finalDuration : 0,
            },
            ...(padding !== undefined ? {
              padding: {
                duration: finalDuration,
                ease: 'easeInOut' as const,
              },
            } : {}),
          },
        };
      }

      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: show ? 1 : 0 },
          transition: { duration: finalDuration, delay: finalDelay, ease: 'easeInOut' as const },
        };

      case 'slide': {
        const slideDistance = 20;
        const slideOffset = {
          left: { x: -slideDistance, y: 0 },
          right: { x: slideDistance, y: 0 },
          up: { x: 0, y: -slideDistance },
          down: { x: 0, y: slideDistance },
        }[slideDirection];

        return {
          initial: { opacity: 0, ...slideOffset },
          animate: {
            opacity: show ? 1 : 0,
            x: show ? 0 : slideOffset.x,
            y: show ? 0 : slideOffset.y,
          },
          transition: { duration: finalDuration, delay: finalDelay, ease: 'easeInOut' as const },
        };
      }

      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: {
            opacity: show ? 1 : 0,
            scale: show ? 1 : 0.95,
          },
          transition: { duration: finalDuration, delay: finalDelay, ease: 'easeInOut' as const },
        };

      case 'rotate':
        return {
          initial: false, // 初期アニメーションなし
          animate: {
            rotate: show ? 0 : rotateDegree,
            scale: show ? rotateScale : 1,
          },
          transition: {
            duration: finalDuration,
            ease: [0.68, -0.55, 0.265, 1.55] as const, // バウンシーなイージング
          },
        };

      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: show ? 1 : 0 },
          transition: { duration: finalDuration, delay: finalDelay, ease: 'easeInOut' as const },
        };
    }
  };

  const config = getAnimationConfig();

  return (
    <motion.div
      className={className}
      data-component="animated"
      data-animation-category={resolvedCategory}
      data-animation-variant={resolvedVariant}
      initial={config.initial}
      animate={config.animate}
      transition={config.transition}
    >
      {children}
    </motion.div>
  );
};
