'use client'

import styles from './CheckBadge.module.scss'

export interface CheckBadgeProps {
  readonly checked: boolean
  readonly onChange: (next: boolean) => void
  readonly label?: string
  readonly disabled?: boolean
  readonly title?: string
  readonly className?: string
}

/**
 * 小さなチェック風ボタン（タスクの done など）。
 */
export function CheckBadge({
  checked,
  onChange,
  label,
  disabled,
  title,
  className,
}: CheckBadgeProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-checked={checked}
      aria-pressed={checked}
      title={title}
    >
      <span className={styles.box}>{checked ? '✓' : ''}</span>
      {label && <span className={styles.label}>{label}</span>}
    </button>
  )
}

export default CheckBadge
