import { Icon } from '../../atoms/Icon'
import type { IconName } from '../../constants'
import type { ReactNode } from 'react'
import styles from './IconLabel.module.scss'

interface IconLabelProps {
  readonly icon?: string
  readonly iconSize?: number
  readonly iconColor?: string
  readonly children: ReactNode
  readonly className?: string
}

export function IconLabel({ icon, iconSize = 12, iconColor, children, className = '' }: IconLabelProps) {
  if (!icon) return <>{children}</>

  return (
    <span data-component="IconLabel" className={`${styles.label} ${className}`}>
      <span className={styles.icon} style={iconColor ? { color: iconColor } : undefined}>
        <Icon name={icon as IconName} size={iconSize} />
      </span>
      <span className={styles.text}>{children}</span>
    </span>
  )
}
