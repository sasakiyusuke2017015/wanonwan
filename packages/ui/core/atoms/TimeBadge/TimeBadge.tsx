import { FC, ReactNode } from 'react'

import { colors } from '../../tokens'

export type TimeBadgeVariant = 'teal' | 'purple' | 'orange' | 'blue' | 'gray'

// variant から色へのマッピング
const variantStyles: Record<TimeBadgeVariant, { bg: string; text: string }> = {
  teal: { bg: '#14b8a6', text: colors.white },
  purple: { bg: '#a855f7', text: colors.white },
  orange: { bg: '#ffedd5', text: '#c2410c' },
  blue: { bg: '#dbeafe', text: '#1d4ed8' },
  gray: { bg: colors.gray[100], text: colors.gray[600] },
}

export interface TimeBadgeProps {
  children: ReactNode
  variant?: TimeBadgeVariant
  /** サイズ: sm = text-xs, md = text-sm */
  size?: 'sm' | 'md'
  className?: string
}

/**
 * TimeBadge - 時間範囲表示用バッジ
 *
 * Usage:
 * <TimeBadge variant="teal">0:00 ~ 5:30</TimeBadge>
 * <TimeBadge variant="purple" size="md">10:00 ~ 15:00</TimeBadge>
 */
export const TimeBadge: FC<TimeBadgeProps> = ({
  children,
  variant = 'teal',
  size = 'sm',
  className = '',
}) => {
  const { bg, text } = variantStyles[variant]

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2.5 py-1'
    : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${className}`}
      style={{ backgroundColor: bg, color: text }}
      data-component="time-badge"
      data-variant={variant}
    >
      {children}
    </span>
  )
}
