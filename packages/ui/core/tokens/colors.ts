/**
 * カラートークン
 * SCSS: _colors.scss と同期
 */

export const colors = {
  // Primary
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Gray
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Calendar
  today: {
    bg: 'rgba(251, 191, 36, 0.15)',
    bgStrong: 'rgba(251, 191, 36, 0.22)',
    border: 'rgba(251, 191, 36, 0.3)',
  },

  // Semantic text/border
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#475569',
  },
  border: {
    primary: '#e2e8f0',
    light: '#f1f5f9',
  },
  surface: {
    popover: '#e2e5eb',
    panel: '#ffffff',
  },
  danger: '#dc2626',

  // Base
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const

export type ColorToken = typeof colors
