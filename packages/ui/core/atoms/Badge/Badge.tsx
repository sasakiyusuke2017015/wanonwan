import { FC, CSSProperties, ReactNode } from 'react'

import styles from './Badge.module.scss'

export type BadgeAppearance = 'default' | 'metric' | 'score' | 'status'
export type BadgeStyleVariant = 'solid' | 'gradient' | 'compact' | 'outline'
export type BadgeSemanticVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'secondary'
export type BadgeSize = 'small' | 'medium' | 'large'
export type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange'

// セマンティック variant から color へのマッピング
const SEMANTIC_TO_COLOR: Record<BadgeSemanticVariant, BadgeColor> = {
  default: 'gray',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'blue',
  secondary: 'gray',
}

interface BadgeProps {
  /** 表示する値（value または children のどちらかを指定） */
  value?: string | number
  /** 子要素（value の代わりに使用可能） */
  children?: ReactNode
  appearance?: BadgeAppearance
  /** スタイルバリアント（solid, gradient, compact） */
  styleVariant?: BadgeStyleVariant
  /** セマンティックバリアント（success, warning, error など） - color を自動設定 */
  variant?: BadgeSemanticVariant
  /** 直接色を指定（variant より優先） */
  color?: BadgeColor
  size?: BadgeSize
  width?: string
  className?: string
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string
}

export const Badge: FC<BadgeProps> = ({
  value,
  children,
  appearance = 'default',
  styleVariant = 'solid',
  variant,
  color,
  size = 'medium',
  width,
  className = '',
  borderRadius = '0.375rem',
}) => {
  // 表示コンテンツ（children 優先、なければ value）
  const content = children ?? value

  // 色の決定: color > variant > デフォルト(blue)
  const resolvedColor = color ?? (variant ? SEMANTIC_TO_COLOR[variant] : 'blue')

  // タグ選択
  const Tag = appearance === 'metric' ? 'div' : 'span'

  // カラークラス名を生成
  const capitalColor = resolvedColor.charAt(0).toUpperCase() + resolvedColor.slice(1)
  const colorClassName =
    styleVariant === 'gradient'
      ? `gradient${capitalColor}`
      : styleVariant === 'outline'
        ? `outline${capitalColor}`
        : `solid${capitalColor}`

  const badgeClasses = [
    styles.badge,
    appearance !== 'default' && styles[appearance],
    styles[size],
    styles[colorClassName],
    styleVariant === 'gradient' && appearance === 'metric' && styles.metricGradient,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const style: CSSProperties = {
    ...(width ? { width } : {}),
    borderRadius,
  }

  return (
    <Tag
      className={badgeClasses}
      style={style}
      data-component="badge"
      data-appearance={appearance}
      data-variant={variant || styleVariant}
    >
      {content}
    </Tag>
  )
}
