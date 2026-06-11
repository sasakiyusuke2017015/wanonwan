/**
 * MemberCard 型定義
 *
 * 汎用メンバーカードコンポーネント用の型
 * apps 側で具体的なデータ型から変換して使用
 */

/** スコア項目 */
export interface ScoreItem {
  label: string
  value: number | null
}

/** ステータス定義（色・ラベル） */
export interface StatusDefinition {
  shortLabel?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange'
}

/** ステータス項目 */
export interface StatusItem {
  label: string
  value: string | null
  definitions: Record<string, StatusDefinition>
  defaultLabel: string
}

/** バッジ項目（面談方式など） */
export interface BadgeItem {
  label: string
  value: string
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange'
}

/** 日付項目 */
export interface DateItem {
  label: string
  value: string | null
}

/** メンバーカードデータ */
export interface MemberCardData {
  /** 一意識別子 */
  id: string
  /** メイン表示名 */
  name: string
  /** サブ情報（部署、役職など） */
  subtitle?: string
  /** スコア一覧 */
  scores?: ScoreItem[]
  /** ステータス一覧 */
  statuses?: StatusItem[]
  /** 日付一覧 */
  dates?: DateItem[]
  /** 追加バッジ */
  badges?: BadgeItem[]
  /** メモ */
  memo?: string
  /** アラート行（赤背景） */
  isAlert?: boolean
}

/** MemberCard Props */
export interface MemberCardProps {
  /** カードデータ */
  data: MemberCardData
  /** 選択状態 */
  selected?: boolean
  /** 選択変更ハンドラ */
  onSelectionChange?: (selected: boolean) => void
  /** カードクリックハンドラ */
  onClick?: () => void
  /** カードの角丸 */
  cardRadius?: string
  /** セル（スコアエリア）の角丸 */
  cellRadius?: string
}
