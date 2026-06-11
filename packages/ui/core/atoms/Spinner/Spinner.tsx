import { FC, CSSProperties } from 'react'

import { colors } from '../../tokens'

export type SpinnerSize = 'sm' | 'md' | 'lg'
export type SpinnerVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

const sizeMap: Record<SpinnerSize, number> = {
  sm: 14,
  md: 20,
  lg: 32,
}

const variantColors: Record<SpinnerVariant, string> = {
  default: colors.gray[400],
  info: colors.semantic.info,
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  error: colors.semantic.error,
}

export interface SpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
}

/**
 * Spinner - ローディングスピナー
 *
 * Usage:
 * <Spinner />
 * <Spinner size="lg" variant="info" />
 */
export const Spinner: FC<SpinnerProps> = ({
  size = 'md',
  variant = 'info',
  className = '',
}) => {
  const px = sizeMap[size]
  const color = variantColors[variant]

  const style: CSSProperties = {
    width: px,
    height: px,
    borderColor: color,
    borderTopColor: 'transparent',
  }

  return (
    <div
      className={`border-2 border-t-transparent rounded-full animate-spin ${className}`}
      style={style}
      data-component="spinner"
      data-variant={variant}
      role="status"
      aria-label="Loading"
    />
  )
}
