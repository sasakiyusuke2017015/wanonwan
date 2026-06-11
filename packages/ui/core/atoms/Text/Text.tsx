import { FC, ReactNode, CSSProperties, HTMLAttributes } from 'react'

import { colors } from '../../tokens'
import { cn } from '../../utils/cn'

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextAlign = 'left' | 'center' | 'right'

/**
 * セマンティックバリアント
 * - default: 通常のテキスト（gray.900）
 * - muted: 補助テキスト（gray.500）
 * - secondary: 二次的なテキスト（gray.600）
 * - success: 成功/完了（semantic.success）
 * - warning: 警告（semantic.warning）
 * - error: エラー（semantic.error）
 * - info: 情報（semantic.info）
 */
export type TextVariant = 'default' | 'muted' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

// variant から色へのマッピング
const variantColors: Record<TextVariant, string> = {
  default: colors.gray[900],
  muted: colors.gray[500],
  secondary: colors.gray[600],
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  error: colors.semantic.error,
  info: colors.semantic.info,
}

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** テキストサイズ */
  size?: TextSize
  /** フォントウェイト */
  weight?: TextWeight
  /** テキスト配置 */
  align?: TextAlign
  /** セマンティックバリアント（color より優先度低） */
  variant?: TextVariant
  /** 色 (Tailwind色名 or カラーコード) - variant より優先 */
  color?: string
  /** 切り詰め */
  truncate?: boolean
  /** as element */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'div'
}

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
}

const weightClasses: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

/**
 * Text - テキスト表示プリミティブ
 * サイズ、ウェイト、配置、色を簡潔に指定可能
 *
 * Usage:
 * - <Text variant="muted">補助テキスト</Text>
 * - <Text variant="error">エラーメッセージ</Text>
 * - <Text color="#ff0000">カスタム色</Text>
 */
export const Text: FC<TextProps> = ({
  children,
  className,
  style,
  size = 'base',
  weight = 'normal',
  align,
  variant = 'default',
  color,
  truncate,
  as: Tag = 'span',
  ...props
}) => {
  const classes = cn(
    sizeClasses[size],
    weightClasses[weight],
    align && alignClasses[align],
    truncate && 'truncate',
    className,
  )

  // 色の決定: color > variant
  const resolvedColor = (() => {
    if (color) {
      // カラーコード指定
      if (color.startsWith('#') || color.startsWith('rgb')) {
        return color
      }
      // Tailwind色名の場合は null（クラスで処理）
      return null
    }
    // variant から色を取得
    return variantColors[variant]
  })()

  const computedStyle: CSSProperties = {
    ...(resolvedColor && { color: resolvedColor }),
    ...style,
  }

  // Tailwind色クラスの場合はclassNameに追加
  const colorClass = color && !color.startsWith('#') && !color.startsWith('rgb') ? `text-${color}` : ''

  return (
    <Tag
      className={cn(classes, colorClass)}
      style={computedStyle}
      data-component="text"
      data-variant={variant}
      {...props}
    >
      {children}
    </Tag>
  )
}
