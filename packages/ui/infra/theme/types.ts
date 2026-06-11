/**
 * テーマ型定義
 *
 * ui-catalog のテーマ機能で使用する型を定義
 */

import type {
  ColorTheme,
  ShapeTheme,
  BackgroundTheme,
  ThemeConfig,
  CardAnimationVariant,
  TableRowAnimationVariant,
  DropMenuAnimationVariant,
} from '../../core/constants'

// ============================================
// Re-export（利便性のため）
// ============================================

export type {
  ColorTheme,
  ShapeTheme,
  BackgroundTheme,
  ThemeConfig,
  CardAnimationVariant,
  TableRowAnimationVariant,
  DropMenuAnimationVariant,
}

// ============================================
// テーマ設定
// ============================================

/**
 * グローバルテーマ設定
 */
export interface GlobalThemeSettings {
  /** カラーテーマ */
  colorTheme: ColorTheme
  /** 形状テーマ */
  shapeTheme: ShapeTheme
  /** 背景テーマ */
  backgroundTheme: BackgroundTheme
}

/**
 * アニメーション設定
 */
export interface AnimationSettings {
  /** テーブル行アニメーション */
  tableRowVariant: TableRowAnimationVariant
  /** カードアニメーション */
  cardVariant: CardAnimationVariant
  /** ドロップメニューアニメーション */
  dropMenuVariant: DropMenuAnimationVariant
  /** アニメーション速度（1.0 = 通常） */
  speed: number
}

/**
 * 完全なテーマ設定
 */
export interface FullThemeSettings extends GlobalThemeSettings {
  /** アニメーション設定 */
  animation: AnimationSettings
}

// ============================================
// デフォルト値
// ============================================

/**
 * デフォルトのグローバルテーマ設定
 */
export const DEFAULT_GLOBAL_THEME: GlobalThemeSettings = {
  colorTheme: 'emerald',
  shapeTheme: 'soft',
  backgroundTheme: 'wood',
}

/**
 * デフォルトのアニメーション設定
 */
export const DEFAULT_ANIMATION: AnimationSettings = {
  tableRowVariant: 'slideLeft',
  cardVariant: 'slideRight',
  dropMenuVariant: 'slideDown',
  speed: 1.0,
}

/**
 * デフォルトの完全テーマ設定
 */
export const DEFAULT_FULL_THEME: FullThemeSettings = {
  ...DEFAULT_GLOBAL_THEME,
  animation: DEFAULT_ANIMATION,
}

// ============================================
// ストレージキー
// ============================================

/**
 * localStorage のキー定義
 * 既存の apps/web との互換性を維持するためプレフィックスなし
 */
export const THEME_STORAGE_KEYS = {
  COLOR_THEME: 'uiColorTheme',
  SHAPE_THEME: 'uiShape',
  BACKGROUND_THEME: 'uiBackground',
  TABLE_ROW_ANIMATION: 'uiTableRowAnimationVariant',
  CARD_ANIMATION: 'uiCardAnimationVariant',
  DROP_MENU_ANIMATION: 'uiDropMenuAnimationVariant',
  ANIMATION_SPEED: 'uiAnimationSpeed',
} as const
