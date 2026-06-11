import styles from './StatusBar.module.scss'

export interface StatusBarProps {
  message: string
  variant?: 'success' | 'error' | 'info'
  className?: string
}

export function StatusBar({
  message,
  variant = 'success',
  className,
}: StatusBarProps) {
  if (!message) return null

  return (
    <footer
      data-component="status-bar"
      className={`${styles.statusBar} ${styles[`statusBar--${variant}`]}${className ? ` ${className}` : ''}`}
    >
      {message}
    </footer>
  )
}
