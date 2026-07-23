import { FC, CSSProperties, ReactNode } from 'react'

import { hexReadableTextColor, isHexColor } from '../../utils/hexColor'
import styles from './Badge.module.scss'

export type BadgeAppearance = 'default' | 'metric' | 'score' | 'status'
export type BadgeStyleVariant = 'solid' | 'gradient' | 'compact' | 'outline'
export type BadgeSize = 'small' | 'medium' | 'large'
export type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange'
export type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger'

// 意味色 (tone) からパレット色への解決
const TONE_TO_COLOR: Record<BadgeTone, BadgeColor> = {
  brand: 'blue',
  neutral: 'gray',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
}

/**
 * 軸の役割 (直交):
 * - 色: `tone` (意味色。アプリの正準) または `color` (動的パレット色。ロール色 / スコア閾値色用)
 * - 塗り: `styleVariant` (solid / gradient / compact / outline)
 * - 用途形状: `appearance` (default / metric / score / status)
 * - 大きさ: `size`
 */
interface BadgeProps {
  /** 表示する値（value または children のどちらかを指定） */
  value?: string | number
  /** 子要素（value の代わりに使用可能） */
  children?: ReactNode
  appearance?: BadgeAppearance
  /** スタイルバリアント（solid, gradient, compact） */
  styleVariant?: BadgeStyleVariant
  /** 意味色 (アプリからは原則こちらを使う) */
  tone?: BadgeTone
  /** 直接色を指定（tone より優先。動的な色分け用） */
  color?: BadgeColor
  /**
   * マスタの「イメージカラー」等、任意 hex (#RGB / #RRGGBB) の背景色。
   * 有効な hex のとき tone / color より優先し、文字色はコントラスト自動導出 (YIQ)。
   * 無効値 / 空は無視して tone / color にフォールバックする。
   */
  hexColor?: string | null
  /**
   * バッジ先頭に出す小さな丸ロゴ画像の URL (マスタの「イメージロゴ」等)。
   * null / 空は何も出さない。alt は装飾扱いで空 (ラベル本文が名前を持つため)。
   */
  logoSrc?: string | null
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
  tone,
  color,
  hexColor,
  logoSrc,
  size = 'medium',
  width,
  className = '',
  borderRadius = '0.375rem',
}) => {
  // 表示コンテンツ（children 優先、なければ value）
  const content = children ?? value

  // 色の決定: color > tone > デフォルト(blue)
  const resolvedColor = color ?? (tone ? TONE_TO_COLOR[tone] : 'blue')

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

  // 任意 hex は inline style でクラス色を上書きする (invalid はフォールバック)。
  const useHex = isHexColor(hexColor)
  const hasLogo = typeof logoSrc === 'string' && logoSrc !== ''
  const style: CSSProperties = {
    ...(width ? { width } : {}),
    borderRadius,
    ...(useHex ? { backgroundColor: hexColor, color: hexReadableTextColor(hexColor) } : {}),
    // ロゴ付きはアイコンとラベルを縦中央で並べるため flex 化する (通常時は既存の inline-block)。
    ...(hasLogo ? { display: 'inline-flex', alignItems: 'center', gap: '0.35em' } : {}),
  }

  return (
    <Tag
      className={badgeClasses}
      style={style}
      data-component="badge"
      data-appearance={appearance}
      data-variant={tone || styleVariant}
    >
      {hasLogo && (
        <img
          src={logoSrc}
          alt=""
          style={{
            width: '1.2em',
            height: '1.2em',
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      )}
      {content}
    </Tag>
  )
}
