'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Icon } from '../../atoms/Icon'
import type { IconName } from '../../constants'
import styles from './ViewModeToggle.module.scss'
import { cn } from '../../utils'

export interface ViewModeOption<T extends string = string> {
  value: T
  label: string
  icon: IconName
}

export interface ViewModeToggleProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options: ViewModeOption<T>[]
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary' | 'teal' | 'dark'
  className?: string
}

export const ViewModeToggle = <T extends string = string>({
  value,
  onChange,
  options,
  showLabel = false,
  size = 'medium',
  variant = 'default',
  className,
}: ViewModeToggleProps<T>) => {
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
      className={cn(styles.container, styles[variant], className)}
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
            onClick={() => onChange(option.value)}
            className={cn(
              styles.button,
              styles[size],
              isActive && styles.active,
            )}
            title={option.label}
          >
            <span className={styles.icon}>
              <Icon
                name={option.icon}
                size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
              />
            </span>
            {showLabel && option.label && (
              <span className={styles.label}>{option.label}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
