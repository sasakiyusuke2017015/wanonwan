'use client'

/**
 * NavItem - サイドバーナビゲーションアイテム
 *
 * ダークテーマのサイドバー用ナビゲーションボタン。
 * D&D対応、選択状態、アクセントカラー対応。
 */

import { Icon } from '@ui-catalog/core/atoms'
import type { IconName } from '@ui-catalog/core/constants'

import styles from './NavItem.module.scss'

export interface NavItemProps {
  /** 表示ラベル */
  label: string
  /** アイコン名 */
  iconName: IconName
  /** 選択状態 */
  selected?: boolean
  /** クリックハンドラ */
  onClick: () => void
  /** 右クリックハンドラ */
  onContextMenu?: (e: React.MouseEvent) => void
  /** D&D: ドラッグオーバー */
  onDragOver?: (e: React.DragEvent) => void
  /** D&D: ドロップ */
  onDrop?: (e: React.DragEvent) => void
  /** D&D: ドラッグリーブ */
  onDragLeave?: (e: React.DragEvent) => void
  /** ミーティングのドロップターゲット状態 */
  isMeetingDropTarget?: boolean
  /** プロジェクトのドロップターゲット状態 */
  isProjectDropTarget?: boolean
  /** アクセントカラー（選択時の左ボーダー色） */
  accentColor?: 'blue' | 'yellow' | 'orange' | 'green' | 'gray' | 'purple'
  /** バッジ（件数表示など） */
  badge?: number | string
  /** 追加のクラス名 */
  className?: string
}

const accentClassMap: Record<string, string> = {
  blue: 'accentBlue',
  yellow: 'accentYellow',
  orange: 'accentOrange',
  green: 'accentGreen',
  gray: 'accentGray',
  purple: 'accentPurple',
}

export function NavItem({
  label,
  iconName,
  selected = false,
  onClick,
  onContextMenu,
  onDragOver,
  onDrop,
  onDragLeave,
  isMeetingDropTarget = false,
  isProjectDropTarget = false,
  accentColor = 'blue',
  badge,
  className = '',
}: NavItemProps) {
  const accentKey = accentClassMap[accentColor] || accentClassMap.blue

  const classNames = [
    styles.navItem,
    selected ? `${styles.selected} ${styles[accentKey]}` : '',
    isMeetingDropTarget ? styles.meetingDropTarget : '',
    isProjectDropTarget ? styles.projectDropTarget : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      data-component="NavItem"
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className={classNames}
    >
      <Icon name={iconName} size={14} className={styles.icon} />
      <span className={styles.label}>{label}</span>
      {badge !== undefined && badge !== 0 && (
        <span className={styles.badge}>{badge}</span>
      )}
    </button>
  )
}
