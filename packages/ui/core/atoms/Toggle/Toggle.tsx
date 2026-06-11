'use client'

import { InputHTMLAttributes, forwardRef, useState, ChangeEvent } from 'react'

import { useOperationLog } from '../../../infra/devtools'

import styles from './Toggle.module.scss'

interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary'
  className?: string
  labelClassName?: string
  containerClassName?: string
  /** トグルスイッチの角丸（例: '8px', '25px'）。指定しない場合は完全な丸（9999px） */
  toggleRadius?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      size = 'medium',
      variant = 'default',
      className = '',
      labelClassName = '',
      containerClassName = '',
      toggleRadius,
      disabled = false,
      checked = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const log = useOperationLog('Toggle')

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      log('toggle', { label, checked: e.target.checked })
      onChange?.(e)
    }

    const hoverShadows = {
      default: 'inset 0 0 0 3px rgba(59, 130, 246, 0.4)',
      primary: 'inset 0 0 0 3px rgba(20, 184, 166, 0.4)',
    }

    const labelSizeClass = {
      small: styles.labelSmall,
      medium: styles.labelMedium,
      large: styles.labelLarge,
    }

    const toggleClasses = [
      styles.toggle,
      styles[size],
      styles[variant],
      checked && styles.checked,
      disabled && styles.disabled,
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

    // トグルコンテナのスタイル（hover効果 + 角丸）
    const toggleStyle: React.CSSProperties = {
      ...(!disabled && isHovered ? { boxShadow: hoverShadows[variant] } : {}),
      ...(toggleRadius ? { borderRadius: toggleRadius } : {}),
    }

    // 中の丸のスタイル（角丸）
    const circleStyle: React.CSSProperties = toggleRadius
      ? { borderRadius: toggleRadius }
      : {}

    if (label) {
      return (
        <label
          className={`${styles.container} ${containerClassName}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          data-component="toggle"
          data-variant={variant}
        >
          <span className={labelClasses}>{label}</span>
          <span className={toggleClasses} style={toggleStyle}>
            <input
              ref={ref}
              type="checkbox"
              className={styles.input}
              disabled={disabled}
              checked={checked}
              onChange={handleChange}
              {...props}
            />
            <span className={styles.circle} style={circleStyle} />
          </span>
        </label>
      )
    }

    return (
      <span
        className={toggleClasses}
        style={toggleStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-component="toggle"
        data-variant={variant}
      >
        <input
          ref={ref}
          type="checkbox"
          className={styles.input}
          disabled={disabled}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <span className={styles.circle} style={circleStyle} />
      </span>
    )
  }
)

Toggle.displayName = 'Toggle'
