import React from 'react'

import styles from './Tooltip.module.scss'

/**
 * `top-end` / `bottom-end` は吹き出しをトリガーの右端に、`top-start` / `bottom-start` は
 * 左端に揃える (矢印はどれもトリガー中央付近)。コンテナの端に置いたトリガーで、
 * 中央揃えだとはみ出して overflow クリップされるケース (DataTable toolbar 等) に使う —
 * コンテナ右端のトリガーは end、左端のトリガーは start。
 */
export type TooltipPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-end'
  | 'bottom-end'
  | 'top-start'
  | 'bottom-start'

export interface TooltipProps {
  /** ツールチップのテキスト */
  content: string
  /** 表示位置 */
  position?: TooltipPosition
  children: React.ReactNode
}

const POSITION_CLASS: Record<TooltipPosition, string> = {
  top: styles.top,
  bottom: styles.bottom,
  left: styles.left,
  right: styles.right,
  'top-end': styles.topEnd,
  'bottom-end': styles.bottomEnd,
  'top-start': styles.topStart,
  'bottom-start': styles.bottomStart,
}

/**
 * CSS のみのツールチップ
 * hover / focus-within で表示 (キーボードフォーカスでも出る)。
 * 短い表示ディレイでカーソル通過時のチラつきを抑える。
 */
export function Tooltip({
  content,
  position = 'bottom',
  children,
}: TooltipProps) {
  const tooltipClasses = [styles.tooltip, POSITION_CLASS[position]]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={styles.wrapper} data-component="tooltip">
      {children}
      <span className={tooltipClasses} role="tooltip" data-position={position}>
        {content}
      </span>
    </span>
  )
}
