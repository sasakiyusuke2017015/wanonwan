/**
 * トランジショントークン
 * SCSS: _transitions.scss と同期
 */

export const duration = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const

export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const transitionProperty = {
  colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  all: 'all',
  none: 'none',
  opacity: 'opacity',
  transform: 'transform',
} as const

export const transitions = {
  duration,
  easing,
  property: transitionProperty,
} as const

export type DurationToken = typeof duration
export type EasingToken = typeof easing
export type TransitionPropertyToken = typeof transitionProperty
