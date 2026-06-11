/**
 * コンポーネントテーマ設定（汎用基盤）
 *
 * コンポーネントごとに使用するテーマを一元管理
 * - 'global': グローバル設定（Jotai atom）を使用
 * - 具体的な値: 固定値を使用
 *
 * 注意: 具体的なコンポーネント名（ThemeableComponent）や
 * ラベル定義は apps 側で定義すること
 */

import type { ColorTheme, ShapeTheme } from '../../core/constants'

// ============================================
// 型定義（汎用）
// ============================================

/**
 * テーマ設定値
 * - 'global': グローバル設定を使用
 * - ColorTheme/ShapeTheme: 固定値を使用
 */
export type ThemeValue<T> = 'global' | T

/**
 * コンポーネントのテーマ設定
 */
export interface ComponentThemeConfig {
  /** カラーテーマ設定 */
  color?: ThemeValue<ColorTheme>
  /** 形状テーマ設定 */
  shape?: ThemeValue<ShapeTheme>
}

/**
 * コンポーネントが使用するテーマ項目の定義
 */
export interface ComponentThemeUsage {
  /** カラーを使用するか */
  usesColor: boolean
  /** 形状を使用するか */
  usesShape: boolean
  /** 背景を使用するか */
  usesBackground: boolean
  /** テーブル行アニメーションを使用するか */
  usesTableRowAnimation: boolean
  /** カードアニメーションを使用するか */
  usesCardAnimation: boolean
  /** ドロップメニューアニメーションを使用するか */
  usesDropMenuAnimation: boolean
}

/**
 * コンポーネントテーマ設定のマップ型（汎用）
 * アプリ側で具体的な型を定義して使用
 */
export type ComponentThemesMap<T extends string = string> = {
  [K in T]?: ComponentThemeConfig
}

// ============================================
// ストレージキー
// ============================================

/** コンポーネントテーマのストレージキー */
export const COMPONENT_THEMES_STORAGE_KEY = 'componentThemes'

// ============================================
// ユーティリティ関数（汎用）
// ============================================

/**
 * コンポーネントのテーマ設定を取得
 */
export function getComponentThemeConfig<T extends string>(
  themes: ComponentThemesMap<T>,
  component: T
): ComponentThemeConfig {
  return themes[component] ?? { color: 'global', shape: 'global' }
}

/**
 * コンポーネントの解決済みテーマ値を計算
 *
 * @param themes コンポーネントテーマ設定マップ
 * @param component コンポーネント名
 * @param globalColor グローバルカラーテーマ
 * @param globalShape グローバル形状テーマ
 * @returns 解決済みのテーマ値
 */
export function resolveComponentTheme<T extends string>(
  themes: ComponentThemesMap<T>,
  component: T,
  globalColor: ColorTheme,
  globalShape: ShapeTheme
): { colorTheme: ColorTheme; shapeTheme: ShapeTheme } {
  const config = getComponentThemeConfig(themes, component)

  return {
    colorTheme:
      config.color === 'global' || config.color === undefined
        ? globalColor
        : config.color,
    shapeTheme:
      config.shape === 'global' || config.shape === undefined
        ? globalShape
        : config.shape,
  }
}
