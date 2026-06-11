'use client'

import {
  TextareaHTMLAttributes,
  ChangeEvent,
  KeyboardEvent,
  FocusEvent,
  forwardRef,
  useState,
} from 'react'

import { useOperationLog } from '../../../infra/devtools'
import styles from './TextArea.module.scss'

interface TextAreaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'onChange' | 'onKeyDown' | 'onFocus' | 'onBlur' | 'size'
  > {
  label?: string
  className?: string
  placeholder?: string
  value?: string
  variant?: 'default' | 'dark' | 'outlined'
  size?: 'small' | 'medium' | 'large'
  error?: boolean
  errorMessage?: string
  required?: boolean
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      className = '',
      placeholder = '',
      value = '',
      variant = 'default',
      size = 'medium',
      error = false,
      errorMessage,
      required = false,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      rows = 4,
      id,
      disabled,
      borderRadius = '0.375rem',
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const log = useOperationLog('TextArea')

    const textareaClasses = [
      styles.textarea,
      styles[variant],
      styles[size],
      error && styles.error,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const textareaStyle: React.CSSProperties = {
      ...(!disabled && isHovered
        ? { boxShadow: 'inset 0 0 0 2px rgba(59, 130, 246, 0.3)' }
        : {}),
      borderRadius,
    }

    return (
      <div
        className={styles.wrapper}
        data-component="textarea"
        data-variant={variant}
        data-size={size}
      >
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && <span className={styles.required}>必須</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={textareaClasses}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          style={textareaStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onChange={(e) => {
            log('change', { length: e.target.value.length })
            onChange?.(e)
          }}
          onKeyDown={onKeyDown}
          onFocus={(e) => {
            log('focus')
            onFocus?.(e)
          }}
          onBlur={(e) => {
            log('blur', { length: e.target.value.length })
            onBlur?.(e)
          }}
          rows={rows}
          {...props}
        />
        {errorMessage && error && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
