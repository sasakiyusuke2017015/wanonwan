import type { ReactNode } from 'react'
import { Text } from '../../atoms/Text'
import styles from './EmptyState.module.scss'

export type EmptyStateVariant = 'default' | 'dashed'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  /**
   * 見た目 variant。`dashed` は dashed border のみ追加 (padding 等は default と同じ)。
   * コンパクト padding が必要な場合は caller 側で `className="py-4"` 等で調整する
   * (Plan v2 §判断 3 / NICE-TO-HAVE 4 反映)。
   */
  variant?: EmptyStateVariant
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const containerClasses = [
    styles.emptyState,
    variant === 'dashed' && styles.dashed,
    className,
  ]
    .filter(Boolean)
    .join(' ')

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
