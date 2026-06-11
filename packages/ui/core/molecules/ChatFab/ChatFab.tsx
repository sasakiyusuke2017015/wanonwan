'use client'

import styles from './ChatFab.module.scss'

export interface ChatFabProps {
  onClick: () => void
  hasMessages?: boolean
  icon?: string
  className?: string
  ariaLabel?: string
}

export function ChatFab({
  onClick,
  hasMessages = false,
  icon = '💬',
  className,
  ariaLabel = 'チャットを開く',
}: ChatFabProps) {
  return (
    <button
      data-component="chat-fab"
      onClick={onClick}
      className={`${styles.fab}${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
    >
      <span className={styles.icon}>{icon}</span>
      {hasMessages && (
        <span className={styles.badge} />
      )}
    </button>
  )
}
