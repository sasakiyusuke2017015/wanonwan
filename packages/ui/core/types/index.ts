/**
 * UI共通の型定義
 *
 * 汎用的なフィルター・テーブル関連の型のみ
 * アプリ固有の型（User, LoginResponse等）は各アプリで定義
 */

/**
 * フィルタータイプ
 */
export type FilterType = 'status' | 'score' | 'text' | 'date' | 'dateRange'

/**
 * ステータスフィルターの選択肢
 */
export interface StatusOption {
  label: string
  value: string
  color?: string
}

/**
 * フィルター設定の共通型
 */
export interface FilterConfig {
  type: FilterType
  options?: StatusOption[]
  min?: number
  max?: number
  placeholder?: string
  /** フィルタの幅（Tailwindクラス例: 'w-32'） */
  width?: string
}

/**
 * accessor/labelを含む完全なフィルター設定
 */
export interface FilterConfigWithMeta extends FilterConfig {
  accessor: string
  label: string
}

/**
 * フィルター値の型定義
 */
export interface FilterValues {
  [key: string]: string[] | [number, number] | string | undefined
}

/**
 * テーマ関連の型定義
 */
export * from './theme'

/**
 * カレンダー関連の型定義
 */
export * from './calendar'
