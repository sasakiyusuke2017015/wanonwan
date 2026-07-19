'use client'

import { useState } from 'react'

import styles from './RatingInput.module.scss'

export interface RatingInputProps {
  /** 現在の評価 (0 = 未選択, 1〜5) */
  value: number
  /** 星クリック / 矢印キーで新しい値を返す */
  onChange: (value: number) => void
  /** 操作不可 (送信中など) */
  disabled?: boolean
  /** 星のフォントサイズ (px) */
  size?: number
  /** radiogroup の aria-label */
  ariaLabel?: string
  className?: string
}

/**
 * RatingInput - ★1〜5 のクリック入力 (controlled)。
 * 表示専用の StarRating とは分離し、radiogroup / radio の a11y と
 * 矢印キー操作 (ArrowLeft/Right で ±1、端でクランプ) を持つ。
 */
export function RatingInput({
  value,
  onChange,
  disabled = false,
  size = 28,
  ariaLabel = '評価',
  className,
}: RatingInputProps) {
  const [hovered, setHovered] = useState(0)
  const shown = hovered > 0 ? hovered : value

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (value < 5) onChange(value + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (value > 1) onChange(value - 1)
    }
  }

  const rootClass = className ? `${styles.ratingInput} ${className}` : styles.ratingInput

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={rootClass}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHovered(0)}
      data-component="rating-input"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`星${star}つ`}
          disabled={disabled}
          className={styles.star}
          data-active={star <= shown ? 'true' : undefined}
          style={{ fontSize: `${size}px` }}
          onClick={() => {
            if (!disabled) onChange(star)
          }}
          onMouseEnter={() => {
            if (!disabled) setHovered(star)
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default RatingInput
