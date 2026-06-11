/**
 * テーマ機能エクスポート
 *
 * @example
 * ```tsx
 * import { useTheme, useColorTheme } from '@ui-catalog/core/theme'
 *
 * const { colors, shapes } = useTheme()
 * const [colorTheme, setColorTheme] = useColorTheme()
 * ```
 */

// 型
export type {
  ColorTheme,
  ShapeTheme,
  BackgroundTheme,
  ThemeConfig,
  CardAnimationVariant,
  TableRowAnimationVariant,
  DropMenuAnimationVariant,
  GlobalThemeSettings,
  AnimationSettings,
  FullThemeSettings,
} from './types'

export {
  DEFAULT_GLOBAL_THEME,
  DEFAULT_ANIMATION,
  DEFAULT_FULL_THEME,
  THEME_STORAGE_KEYS,
} from './types'

// Storage ユーティリティ
export {
  isBrowser,
  getStoredValue,
  setStoredValue,
  removeStoredValue,
  atomWithStorageSync,
} from './storage'

// Jotai Atoms
export {
  colorThemeAtom,
  shapeThemeAtom,
  backgroundThemeAtom,
  tableRowAnimationAtom,
  cardAnimationAtom,
  dropMenuAnimationAtom,
  animationSpeedAtom,
  themeConfigAtom,
  resetThemeAtom,
  resetAnimationAtom,
  resetAllThemeAtom,
} from './atoms'

// Hooks
export {
  useTheme,
  useColorTheme,
  useShapeTheme,
  useBackgroundTheme,
  useBackgroundStyle,
  useTableRowAnimation,
  useCardAnimation,
  useDropMenuAnimation,
  useAnimationSpeed,
  useResetTheme,
  useResetAnimation,
  useResetAllTheme,
  useFullTheme,
} from './useTheme'

// コンポーネント別テーマ（汎用基盤のみ）
// 注意: 具体的なコンポーネント名・ラベル・Atoms は apps 側で定義
export type {
  ThemeValue,
  ComponentThemeConfig,
  ComponentThemeUsage,
  ComponentThemesMap,
} from './componentThemes'

export {
  COMPONENT_THEMES_STORAGE_KEY,
  getComponentThemeConfig,
  resolveComponentTheme,
} from './componentThemes'
