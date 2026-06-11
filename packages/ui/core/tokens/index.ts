/**
 * @ui-catalog/core/tokens
 *
 * デザイントークン - UIの基礎となる値の定義
 * SCSS版とTypeScript版を同期管理
 */

// Colors
export { colors } from './colors'
export type { ColorToken } from './colors'

// Spacing
export { spacing } from './spacing'
export type { SpacingToken, SpacingKey } from './spacing'

// Typography
export {
  typography,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
} from './typography'
export type { Typography } from './typography'

// Shadows
export { shadows, focusRing } from './shadows'
export type { ShadowToken, FocusRingToken } from './shadows'

// Borders
export { borders, borderRadius, borderWidth } from './borders'
export type { BorderRadiusToken, BorderWidthToken } from './borders'

// Transitions
export {
  transitions,
  duration,
  easing,
  transitionProperty,
} from './transitions'
export type {
  DurationToken,
  EasingToken,
  TransitionPropertyToken,
} from './transitions'

/**
 * 全トークンをまとめたオブジェクト
 */
import { colors as colorsToken } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'
import { shadows, focusRing } from './shadows'
import { borders } from './borders'
import { transitions } from './transitions'

export const tokens = {
  colors: colorsToken,
  spacing,
  typography,
  shadows,
  focusRing,
  borders,
  transitions,
} as const
