import { FC } from 'react'

import styles from './Progress.module.scss'

export type ProgressSize = 'small' | 'medium' | 'large'
export type ProgressColor = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange'

export type ProgressAnimation = 'none' | 'pulse' | 'shimmer'

export interface ProgressProps {
  value: number
  max?: number
  size?: ProgressSize
  color?: ProgressColor
  className?: string
  showLabel?: boolean
  /** 停滞状態（警告色に自動変更） */
  isStalled?: boolean
  /** アニメーション種類（デフォルト: none） */
  animation?: ProgressAnimation
}

export const Progress: FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'medium',
  color = 'blue',
  className = '',
  showLabel = false,
  isStalled = false,
  animation = 'none',
}) => {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100)
  // 停滞時は yellow（警告色）を使用
  const effectiveColor = isStalled ? 'yellow' : color
  const capitalColor = effectiveColor.charAt(0).toUpperCase() + effectiveColor.slice(1)

  const trackClasses = [
    styles.track,
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const indicatorClasses = [
    styles.indicator,
    styles[`color${capitalColor}`],
    animation === 'pulse' && styles.pulse,
    animation === 'shimmer' && styles.shimmer,
    isStalled && styles.stalled,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={trackClasses}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      data-component="progress"
      data-stalled={isStalled || undefined}
    >
      <div
        className={indicatorClasses}
        style={{ width: `${percent}%` }}
      />
      {showLabel && (
        <span className={styles.label}>{percent.toFixed(1)}%</span>
      )}
    </div>
  )
}
