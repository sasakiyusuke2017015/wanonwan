'use client'

import { InputHTMLAttributes, forwardRef, useState, ChangeEvent } from 'react'

import { useOperationLog } from '../../../infra/devtools'
import styles from './Radio.module.scss'

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary'
  className?: string
  labelClassName?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      size = 'medium',
      variant = 'default',
      className = '',
      labelClassName = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const log = useOperationLog('Radio')

    const hoverShadows = {
      default: 'inset 0 0 0 3px rgba(59, 130, 246, 0.4)',
      primary: 'inset 0 0 0 3px rgba(20, 184, 166, 0.4)',
    }

    const labelSizeClass = {
      small: styles.labelSmall,
      medium: styles.labelMedium,
      large: styles.labelLarge,
    }

    const radioClasses = [
      styles.radio,
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
      !disabled && isHovered ? { boxShadow: hoverShadows[variant] } : {}

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      log('change', { checked: e.target.checked, value: e.target.value, label })
      props.onChange?.(e)
    }

    const radioElement = (
      <input
        ref={ref}
        type="radio"
        className={radioClasses}
        disabled={disabled}
        style={hoverStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onChange={handleChange}
        data-component="radio"
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
          data-component="radio"
          data-variant={variant}
        >
          {radioElement}
          <span className={labelClasses}>{label}</span>
        </label>
      )
    }

    return radioElement
  }
)

Radio.displayName = 'Radio'
