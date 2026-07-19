'use client'

import type { ReactNode } from 'react'

import { Radio } from '../../atoms/Radio'

import styles from './RadioCard.module.scss'

export interface RadioCardProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  title: ReactNode
  description?: ReactNode
  disabled?: boolean
  className?: string
}

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  disabled = false,
  className = '',
}: RadioCardProps) {
  const rootClasses = [
    styles.radioCard,
    checked && styles.checked,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label
      className={rootClasses}
      data-component="radio-card"
      aria-disabled={disabled || undefined}
    >
      <Radio
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className={styles.radio}
      />
      <span className={styles.body}>
        <span className={styles.title} data-component="radio-card-title">
          {title}
        </span>
        {description && (
          <span className={styles.description} data-component="radio-card-description">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}
