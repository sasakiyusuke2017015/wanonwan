'use client'

import { InputHTMLAttributes, forwardRef, useState, ChangeEvent } from 'react'

import { useOperationLog } from '../../../infra/devtools'

import styles from './Switch.module.scss'

export interface SwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'checked' | 'onChange'
  > {
  /** ON/OFF 状態 (controlled) */
  checked: boolean
  /** 変更後の値を生値で受け取る (event ではない) */
  onChange?: (next: boolean) => void
  label?: string
  size?: 'small' | 'medium' | 'large'
  /**
   * 色系統。default: OFF 赤 / ON 青、primary: OFF 赤 / ON teal、
   * neutral: OFF 灰 / ON 緑 (公開状態などの中立トグル向け)
   */
  variant?: 'default' | 'primary' | 'neutral'
  className?: string
  labelClassName?: string
  containerClassName?: string
  /** トグルスイッチの角丸（例: '8px'）。指定しない場合は完全な丸（9999px） */
  toggleRadius?: string
}

/**
 * boolean トグルスイッチの正準 atom (input[type=checkbox] + role="switch")。
 * 同一操作モデルの実装を増やさないこと。
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
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
      checked,
      onChange,
      title,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const log = useOperationLog('Switch')

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      log('toggle', { label, checked: e.target.checked })
      onChange?.(e.target.checked)
    }

    const hoverShadows = {
      default: 'inset 0 0 0 3px rgba(59, 130, 246, 0.4)',
      primary: 'inset 0 0 0 3px rgba(20, 184, 166, 0.4)',
      neutral: 'inset 0 0 0 3px rgba(16, 185, 129, 0.4)',
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
          data-component="switch"
          data-variant={variant}
          title={title}
        >
          <span className={labelClasses}>{label}</span>
          <span className={toggleClasses} style={toggleStyle}>
            <input
              ref={ref}
              type="checkbox"
              role="switch"
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
        data-component="switch"
        data-variant={variant}
        title={title}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
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

Switch.displayName = 'Switch'

export default Switch
