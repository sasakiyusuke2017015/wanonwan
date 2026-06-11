/**
 * Calendar 定数
 */

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

export const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
] as const;

/** デフォルト値 */
export const DEFAULTS = {
  PRIMARY_BG_COLOR: '#3b82f6',
  BORDER_RADIUS: '0.375rem',
} as const;

/** アニメーション時間(ms) */
export const ANIMATION_DURATION = 550;
