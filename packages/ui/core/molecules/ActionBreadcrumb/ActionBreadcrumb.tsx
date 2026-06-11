'use client'

import { useOperationLog } from '../../../infra/devtools'
import styles from './ActionBreadcrumb.module.scss'

export interface ActionBreadcrumbItem {
  label: string
  onClick?: () => void
}

export interface ActionBreadcrumbProps {
  items: ActionBreadcrumbItem[]
  separator?: string
  className?: string
}

export function ActionBreadcrumb({
  items,
  separator = '/',
  className,
}: ActionBreadcrumbProps) {
  const log = useOperationLog('ActionBreadcrumb')

  const handleClick = (item: ActionBreadcrumbItem) => {
    log('click', { label: item.label })
    item.onClick?.()
  }

  const navClasses = [styles.actionBreadcrumb, className].filter(Boolean).join(' ')

  return (
    <nav data-component="action-breadcrumb" aria-label="パンくずリスト" className={navClasses}>
      {items.map((item, i) => (
        <span key={i} className={styles.actionBreadcrumb__item}>
          {i > 0 && <span className={styles.actionBreadcrumb__separator}>{separator}</span>}
          {item.onClick ? (
            <button
              onClick={() => handleClick(item)}
              className={styles.actionBreadcrumb__button}
            >
              {item.label}
            </button>
          ) : (
            <span className={styles.actionBreadcrumb__current}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
