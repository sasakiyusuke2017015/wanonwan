/**
 * テーマ取得 Hooks
 *
 * コンポーネントからテーマ設定を取得するための便利な hooks
 */

import { useAtomValue, useSetAtom } from 'jotai'

import { getThemeConfig, getBackgroundStyle } from '../../core/constants'
import type { ThemeConfig } from '../../core/constants'
import {
  colorThemeAtom,
  shapeThemeAtom,
  backgroundThemeAtom,
  themeConfigAtom,
  tableRowAnimationAtom,
  cardAnimationAtom,
  dropMenuAnimationAtom,
  animationSpeedAtom,
  resetThemeAtom,
  resetAnimationAtom,
  resetAllThemeAtom,
} from './atoms'

// ============================================
// 基本 Hooks
// ============================================

/**
 * テーマ設定（colors, shapes）を取得
 *
 * @example
 * ```tsx
 * const { colors, shapes } = useTheme()
 * <div style={{ backgroundColor: colors.primaryBgColor }}>
 * ```
 */
export function useTheme(): ThemeConfig {
  return useAtomValue(themeConfigAtom)
}

/**
 * カラーテーマを取得・設定
 *
 * @example
 * ```tsx
 * const [colorTheme, setColorTheme] = useColorTheme()
 * setColorTheme('emerald')
 * ```
 */
export function useColorTheme() {
  const value = useAtomValue(colorThemeAtom)
  const setter = useSetAtom(colorThemeAtom)
  return [value, setter] as const
}

/**
 * 形状テーマを取得・設定
 */
export function useShapeTheme() {
  const value = useAtomValue(shapeThemeAtom)
  const setter = useSetAtom(shapeThemeAtom)
  return [value, setter] as const
}

/**
 * 背景テーマを取得・設定
 */
export function useBackgroundTheme() {
  const value = useAtomValue(backgroundThemeAtom)
  const setter = useSetAtom(backgroundThemeAtom)
  return [value, setter] as const
}

/**
 * 背景スタイルを取得（CSS properties）
 *
 * @example
 * ```tsx
 * const backgroundStyle = useBackgroundStyle()
 * <div style={backgroundStyle}>
 * ```
 */
export function useBackgroundStyle(): React.CSSProperties {
  const backgroundTheme = useAtomValue(backgroundThemeAtom)
  return getBackgroundStyle(backgroundTheme)
}

// ============================================
// アニメーション Hooks
// ============================================

/**
 * テーブル行アニメーションを取得・設定
 */
export function useTableRowAnimation() {
  const value = useAtomValue(tableRowAnimationAtom)
  const setter = useSetAtom(tableRowAnimationAtom)
  return [value, setter] as const
}

/**
 * カードアニメーションを取得・設定
 */
export function useCardAnimation() {
  const value = useAtomValue(cardAnimationAtom)
  const setter = useSetAtom(cardAnimationAtom)
  return [value, setter] as const
}

/**
 * ドロップメニューアニメーションを取得・設定
 */
export function useDropMenuAnimation() {
  const value = useAtomValue(dropMenuAnimationAtom)
  const setter = useSetAtom(dropMenuAnimationAtom)
  return [value, setter] as const
}

/**
 * アニメーション速度を取得・設定
 */
export function useAnimationSpeed() {
  const value = useAtomValue(animationSpeedAtom)
  const setter = useSetAtom(animationSpeedAtom)
  return [value, setter] as const
}

// ============================================
// リセット Hooks
// ============================================

/**
 * テーマリセット関数を取得
 */
export function useResetTheme() {
  return useSetAtom(resetThemeAtom)
}

/**
 * アニメーションリセット関数を取得
 */
export function useResetAnimation() {
  return useSetAtom(resetAnimationAtom)
}

/**
 * 全設定リセット関数を取得
 */
export function useResetAllTheme() {
  return useSetAtom(resetAllThemeAtom)
}

// ============================================
// 複合 Hook
// ============================================

/**
 * 全テーマ設定を一括取得
 *
 * @example
 * ```tsx
 * const theme = useFullTheme()
 * theme.colors.primaryBgColor
 * theme.shapes.borderRadius
 * theme.backgroundStyle
 * theme.animation.cardVariant
 * ```
 */
export function useFullTheme() {
  const colorTheme = useAtomValue(colorThemeAtom)
  const shapeTheme = useAtomValue(shapeThemeAtom)
  const backgroundTheme = useAtomValue(backgroundThemeAtom)
  const tableRowAnimation = useAtomValue(tableRowAnimationAtom)
  const cardAnimation = useAtomValue(cardAnimationAtom)
  const dropMenuAnimation = useAtomValue(dropMenuAnimationAtom)
  const animationSpeed = useAtomValue(animationSpeedAtom)

  const config = getThemeConfig(colorTheme, shapeTheme)
  const backgroundStyle = getBackgroundStyle(backgroundTheme)

  return {
    // 生の値
    colorTheme,
    shapeTheme,
    backgroundTheme,
    // 計算済み
    colors: config.colors,
    shapes: config.shapes,
    backgroundStyle,
    // アニメーション
    animation: {
      tableRowVariant: tableRowAnimation,
      cardVariant: cardAnimation,
      dropMenuVariant: dropMenuAnimation,
      speed: animationSpeed,
    },
  }
}
