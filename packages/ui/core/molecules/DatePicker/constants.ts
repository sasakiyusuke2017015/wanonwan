/**
 * DatePicker 定数
 */

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

export const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
] as const;

/** 日付範囲デフォルト値 */
export const DATE_RANGE_DEFAULTS = {
  MONTH_MIN: '1899-12',
  MONTH_MAX: '2099-12',
  DATE_MIN: '1899-12-30',
  DATE_MAX: '2099-12-31',
} as const;

/** アニメーション時間(ms) */
export const ANIMATION_DURATION = 550;

/** ポップアップ幅 */
export const POPUP_WIDTH = { month: '280px', date: '290px' } as const;

/** サイズ別スタイル */
export const SIZE_STYLES = {
  small: 'px-2 py-1 text-fluid-sm pr-14',
  medium: 'px-3 py-2 text-fluid-base pr-16',
  large: 'px-4 py-3 text-fluid-lg pr-18',
} as const;

/** バリアント別スタイル */
export const VARIANT_STYLES = {
  dark: 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20',
  outlined: 'bg-transparent border-2 border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-blue-500/20',
  default: 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20',
  minimal: 'bg-transparent border-none text-gray-700 hover:bg-gray-100 focus:ring-0',
} as const;

/** アイコンサイズ */
export const ICON_SIZES = { small: 16, medium: 20, large: 24 } as const;
export const NAV_ICON_SIZES = { small: 16, medium: 18, large: 20 } as const;
