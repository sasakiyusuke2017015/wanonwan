'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Icon, type AnyIconName } from '../../atoms/Icon'
import styles from './SegmentedControl.module.scss'
import { cn } from '../../utils'

export interface SegmentedControlOption<T extends string = string> {
  value: T
  label: string
  /** 任意。指定時はラベルの前にアイコンを表示 (showLabel=false なら icon のみ) */
  icon?: AnyIconName
}

export interface SegmentedControlProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedControlOption<T>[]
  /** ラベル表示。false で icon-only (表示切替トグル等の省スペース用途) */
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary' | 'teal' | 'dark'
  disabled?: boolean
  className?: string
}

/**
 * SegmentedControl - 常時展開・単一選択のセグメントコントロール (正準)
 *
 * N 択から 1 つ選ぶ横並びボタン群。選択位置へスライダーが滑らかに移動する。
 * 同一操作モデルの実装を増やさないこと (ui-architecture.md §3)。
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   value={viewMode}
 *   onChange={setViewMode}
 *   options={[
 *     { value: 'table', label: 'テーブル', icon: 'list' },
 *     { value: 'card', label: 'カード', icon: 'dashboard' },
 *   ]}
 * />
 * ```
 */
export const SegmentedControl = <T extends string = string>({
  value,
  onChange,
  options,
  showLabel = true,
  size = 'medium',
  variant = 'default',
  disabled = false,
  className,
}: SegmentedControlProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  const updateSlider = useCallback(() => {
    const activeIdx = options.findIndex((o) => o.value === value)
    const btn = buttonRefs.current[activeIdx]
    const container = containerRef.current
    if (!btn || !container) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setSliderStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    })
  }, [value, options])

  useEffect(() => {
    updateSlider()
  }, [updateSlider])

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      className={cn(styles.container, styles[variant], disabled && styles.disabled, className)}
      data-component="segmented-control"
      data-variant={variant}
    >
      {/* Sliding background */}
      <div
        className={styles.slider}
        style={{ left: sliderStyle.left, width: sliderStyle.width }}
      />

      {/* Buttons */}
      {options.map((option, idx) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            ref={(el) => { buttonRefs.current[idx] = el }}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              styles.button,
              styles[size],
              isActive && styles.active,
            )}
            title={option.label}
          >
            {option.icon && (
              <span className={styles.icon}>
                <Icon
                  name={option.icon}
                  size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
                />
              </span>
            )}
            {showLabel && option.label && (
              <span className={styles.label}>{option.label}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
