'use client'

import { InputHTMLAttributes, forwardRef, useState, ChangeEvent } from 'react'

import { useOperationLog } from '../../../infra/devtools'
import styles from './Checkbox.module.scss'

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary'
  className?: string
  labelClassName?: string
  forceHovered?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = 'medium',
      variant = 'default',
      className = '',
      labelClassName = '',
      disabled = false,
      forceHovered = false,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const log = useOperationLog('Checkbox')

    const hoverShadows = {
      default: '0 0 0 3px rgba(59, 130, 246, 0.3), inset 0 0 0 2px rgba(59, 130, 246, 0.5)',
      primary: '0 0 0 3px rgba(20, 184, 166, 0.3), inset 0 0 0 2px rgba(20, 184, 166, 0.5)',
    }

    const labelSizeClass = {
      small: styles.labelSmall,
      medium: styles.labelMedium,
      large: styles.labelLarge,
    }

    const checkboxClasses = [
      styles.checkbox,
      styles[size],
      styles[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const labelClasses = [
      styles.label,
      labelSizeClass[size],
      disabled && styles.labelDisabled,
      labelClassName,
    ]
      .filter(Boolean)
      .join(' ')

    const hoverStyle =
      !disabled && (isHovered || forceHovered)
        ? { boxShadow: hoverShadows[variant] }
        : {}

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      log('change', { checked: e.target.checked, label })
      props.onChange?.(e)
    }

    const checkboxElement = (
      <input
        ref={ref}
        type="checkbox"
        className={checkboxClasses}
        disabled={disabled}
        style={hoverStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onChange={handleChange}
        data-component="checkbox"
        data-variant={variant}
        {...props}
      />
    )

    if (label) {
      return (
        <label
          className={styles.wrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          data-component="checkbox"
          data-variant={variant}
        >
          {checkboxElement}
          <span className={labelClasses}>{label}</span>
        </label>
      )
    }

    return checkboxElement
  }
)

Checkbox.displayName = 'Checkbox'
