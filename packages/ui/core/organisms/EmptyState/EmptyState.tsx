import type { ReactNode } from 'react'
import { Text } from '../../atoms/Text'
import styles from './EmptyState.module.scss'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const containerClasses = [styles.emptyState, className].filter(Boolean).join(' ')

  return (
    <div data-component="empty-state" className={containerClasses}>
      {icon && <div className={styles.emptyState__icon}>{icon}</div>}
      <Text as="h3" size="lg" weight="semibold" className={styles.emptyState__title}>{title}</Text>
      {description && (
        <Text as="p" variant="muted" className={styles.emptyState__description}>{description}</Text>
      )}
      {action}
    </div>
  )
}
