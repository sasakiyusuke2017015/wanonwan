/**
 * テーマ Jotai Atoms
 *
 * localStorage 連携付きのテーマ状態管理
 * apps 側は import して使うだけで永続化される
 */

import { atom } from 'jotai'

import { getThemeConfig } from '../../core/constants'
import type {
  ColorTheme,
  ShapeTheme,
  BackgroundTheme,
  ThemeConfig,
  CardAnimationVariant,
  TableRowAnimationVariant,
  DropMenuAnimationVariant,
} from '../../core/constants'
import type { ColorScheme, ResolvedColorScheme } from './types'
import {
  DEFAULT_GLOBAL_THEME,
  DEFAULT_ANIMATION,
  DEFAULT_COLOR_SCHEME,
  THEME_STORAGE_KEYS,
} from './types'
import { atomWithStorageSync } from './storage'

// ============================================
// 基本テーマ Atoms
// ============================================

/**
 * カラーテーマ Atom
 */
export const colorThemeAtom = atomWithStorageSync<ColorTheme>(
  THEME_STORAGE_KEYS.COLOR_THEME,
  DEFAULT_GLOBAL_THEME.colorTheme
)
colorThemeAtom.debugLabel = 'colorTheme'

/**
 * 形状テーマ Atom
 */
export const shapeThemeAtom = atomWithStorageSync<ShapeTheme>(
  THEME_STORAGE_KEYS.SHAPE_THEME,
  DEFAULT_GLOBAL_THEME.shapeTheme
)
shapeThemeAtom.debugLabel = 'shapeTheme'

/**
 * 背景テーマ Atom
 */
export const backgroundThemeAtom = atomWithStorageSync<BackgroundTheme>(
  THEME_STORAGE_KEYS.BACKGROUND_THEME,
  DEFAULT_GLOBAL_THEME.backgroundTheme
)
backgroundThemeAtom.debugLabel = 'backgroundTheme'

/**
 * 明暗 Atom（light / dark / system）
 *
 * 色テーマ・背景テーマとは直交する軸。`system` は OS 設定に追従する。
 */
export const colorSchemeAtom = atomWithStorageSync<ColorScheme>(
  THEME_STORAGE_KEYS.COLOR_SCHEME,
  DEFAULT_COLOR_SCHEME
)
colorSchemeAtom.debugLabel = 'colorScheme'

/**
 * OS の明暗設定。`system` を解決するためだけに使う。
 *
 * 初期値は light 固定。実際の値は `useApplyColorScheme` が mount 直後に `matchMedia` を
 * 読んで set し、以後は `change` を購読して追従する。ここで module 評価時に読むと
 * SSR と client で初期値が食い違う入口になるだけで、購読側が即座に上書きするため利得が無い。
 */
export const systemColorSchemeAtom = atom<ResolvedColorScheme>('light')
systemColorSchemeAtom.debugLabel = 'systemColorScheme'

/**
 * `system` を解決した後の実際の明暗（派生）。`<html data-theme-mode>` に入る値。
 */
export const resolvedColorSchemeAtom = atom<ResolvedColorScheme>((get) => {
  const scheme = get(colorSchemeAtom)
  return scheme === 'system' ? get(systemColorSchemeAtom) : scheme
})
resolvedColorSchemeAtom.debugLabel = 'resolvedColorScheme'

// ============================================
// アニメーション Atoms
// ============================================

/**
 * テーブル行アニメーション Atom
 */
export const tableRowAnimationAtom = atomWithStorageSync<TableRowAnimationVariant>(
  THEME_STORAGE_KEYS.TABLE_ROW_ANIMATION,
  DEFAULT_ANIMATION.tableRowVariant
)
tableRowAnimationAtom.debugLabel = 'tableRowAnimation'

/**
 * カードアニメーション Atom
 */
export const cardAnimationAtom = atomWithStorageSync<CardAnimationVariant>(
  THEME_STORAGE_KEYS.CARD_ANIMATION,
  DEFAULT_ANIMATION.cardVariant
)
cardAnimationAtom.debugLabel = 'cardAnimation'

/**
 * ドロップメニューアニメーション Atom
 */
export const dropMenuAnimationAtom = atomWithStorageSync<DropMenuAnimationVariant>(
  THEME_STORAGE_KEYS.DROP_MENU_ANIMATION,
  DEFAULT_ANIMATION.dropMenuVariant
)
dropMenuAnimationAtom.debugLabel = 'dropMenuAnimation'

/**
 * アニメーション速度 Atom
 */
export const animationSpeedAtom = atomWithStorageSync<number>(
  THEME_STORAGE_KEYS.ANIMATION_SPEED,
  DEFAULT_ANIMATION.speed
)
animationSpeedAtom.debugLabel = 'animationSpeed'

// ============================================
// 派生 Atoms
// ============================================

/**
 * テーマ設定 Atom（派生）
 * colors, shapes を一括で取得
 */
export const themeConfigAtom = atom<ThemeConfig>((get) => {
  const color = get(colorThemeAtom)
  const shape = get(shapeThemeAtom)
  return getThemeConfig(color, shape)
})
themeConfigAtom.debugLabel = 'themeConfig'

// ============================================
// リセット Atoms
// ============================================

/**
 * テーマ設定をデフォルトにリセット（write-only）
 */
export const resetThemeAtom = atom(null, (_get, set) => {
  set(colorThemeAtom, DEFAULT_GLOBAL_THEME.colorTheme)
  set(shapeThemeAtom, DEFAULT_GLOBAL_THEME.shapeTheme)
  set(backgroundThemeAtom, DEFAULT_GLOBAL_THEME.backgroundTheme)
  set(colorSchemeAtom, DEFAULT_COLOR_SCHEME)
})
resetThemeAtom.debugLabel = 'resetTheme'

/**
 * アニメーション設定をデフォルトにリセット（write-only）
 */
export const resetAnimationAtom = atom(null, (_get, set) => {
  set(tableRowAnimationAtom, DEFAULT_ANIMATION.tableRowVariant)
  set(cardAnimationAtom, DEFAULT_ANIMATION.cardVariant)
  set(dropMenuAnimationAtom, DEFAULT_ANIMATION.dropMenuVariant)
  set(animationSpeedAtom, DEFAULT_ANIMATION.speed)
})
resetAnimationAtom.debugLabel = 'resetAnimation'

/**
 * 全設定をデフォルトにリセット（write-only）
 */
export const resetAllThemeAtom = atom(null, (_get, set) => {
  set(resetThemeAtom)
  set(resetAnimationAtom)
})
resetAllThemeAtom.debugLabel = 'resetAllTheme'
