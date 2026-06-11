'use client'

import styles from './Switch.module.scss'

export interface SwitchProps {
  readonly on: boolean
  readonly onChange: (next: boolean) => void
  readonly label?: string
  readonly disabled?: boolean
  readonly title?: string
  readonly className?: string
}

/**
 * シンプルなトグルスイッチ atom。
 * 見た目のみに責任を持ち、ロジックは呼び出し側。
 */
export function Switch({
  on,
  onChange,
  label,
  disabled,
  title,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      disabled={disabled}
      className={`${styles.switch}${className ? ` ${className}` : ''}`}
      data-on={on}
      aria-pressed={on}
      title={title}
    >
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </button>
  )
}

export default Switch
