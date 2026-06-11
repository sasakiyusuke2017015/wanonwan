import React from 'react'

import styles from './Tooltip.module.scss'

export interface TooltipProps {
  /** ツールチップのテキスト */
  content: string
  /** 表示位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode
}

/**
 * CSS のみの即時ツールチップ
 * ホバーで遅延なく表示される
 */
export function Tooltip({
  content,
  position = 'bottom',
  children,
}: TooltipProps) {
  const tooltipClasses = [styles.tooltip, styles[position]]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={styles.wrapper} data-component="tooltip">
      {children}
      <span className={tooltipClasses} role="tooltip">
        {content}
      </span>
    </span>
  )
}
