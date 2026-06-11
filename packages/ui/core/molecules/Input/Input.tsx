'use client'

import {
  InputHTMLAttributes,
  ChangeEvent,
  KeyboardEvent,
  FocusEvent,
  forwardRef,
  useState,
} from 'react'

import { type IconName } from '../../constants'
import { useOperationLog } from '../../../infra/devtools'
import { Icon } from '../../atoms/Icon'

import styles from './Input.module.scss'

interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'onKeyDown' | 'onFocus' | 'onBlur' | 'size'
  > {
  type?: string
  className?: string
  placeholder?: string
  value?: string
  variant?: 'default' | 'dark' | 'outlined'
  size?: 'small' | 'medium' | 'large'
  icon?: IconName
  iconPosition?: 'left' | 'right'
  iconClassName?: string
  onIconClick?: () => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      className = '',
      placeholder = '',
      value = '',
      variant = 'default',
      size = 'medium',
      icon,
      iconPosition = 'right',
      iconClassName = '',
      onIconClick,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      disabled,
      borderRadius = '0.375rem',
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const log = useOperationLog('Input')

    const iconSizes = {
      small: 16,
      medium: 20,
      large: 24,
    }

    // クラス名を構築
    const inputClasses = [
      styles.input,
      styles[variant],
      styles[size],
      icon && iconPosition === 'left' && styles.iconLeft,
      icon && iconPosition === 'right' && styles.iconRight,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    // カスタムスタイル
    const customStyle: React.CSSProperties = {
      ...(!disabled && isHovered
        ? { boxShadow: 'inset 0 0 0 2px rgba(59, 130, 246, 0.3)' }
        : {}),
      borderRadius,
    }

    const iconWrapperClasses = [
      styles.iconWrapper,
      iconPosition === 'left' ? styles.iconWrapperLeft : styles.iconWrapperRight,
      onIconClick && styles.iconClickable,
    ]
      .filter(Boolean)
      .join(' ')

    if (icon) {
      return (
        <div
          className={styles.wrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          data-component="input"
          data-variant={variant}
          data-size={size}
        >
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            style={customStyle}
            onChange={(e) => {
              log('change', { variant, size, valueLength: e.target.value.length })
              onChange?.(e)
            }}
            onKeyDown={onKeyDown}
            onFocus={(e) => {
              log('focus', { variant, size })
              onFocus?.(e)
            }}
            onBlur={(e) => {
              log('blur', { variant, size })
              onBlur?.(e)
            }}
            {...props}
          />
          <div
            className={iconWrapperClasses}
            onClick={onIconClick}
            onKeyDown={(e) => {
              if (onIconClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onIconClick()
              }
            }}
            role={onIconClick ? 'button' : undefined}
            tabIndex={onIconClick ? 0 : undefined}
            aria-label={onIconClick ? 'アイコン操作' : undefined}
          >
            <Icon
              name={icon}
              size={iconSizes[size]}
              className={`${styles.icon} ${iconClassName}`}
            />
          </div>
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        style={customStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onChange={(e) => {
          log('change', { variant, size, valueLength: e.target.value.length })
          onChange?.(e)
        }}
        onKeyDown={onKeyDown}
        onFocus={(e) => {
          log('focus', { variant, size })
          onFocus?.(e)
        }}
        onBlur={(e) => {
          log('blur', { variant, size })
          e.target.setSelectionRange(0, 0)
          e.target.scrollLeft = 0
          onBlur?.(e)
        }}
        data-component="input"
        data-variant={variant}
        data-size={size}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
