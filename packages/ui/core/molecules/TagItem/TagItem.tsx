'use client'

/**
 * TagItem - タグアイテム
 *
 * ドラッグ可能なタグアイテム。
 * チェックボックス風の選択UI、カラードット表示。
 */

import { Icon } from '@ui-catalog/core/atoms'

import styles from './TagItem.module.scss'

/** タグカラー → SCSS module クラスのマッピング */
const TAG_COLOR_CLASS_MAP: Record<string, string> = {
  red: 'colorRed',
  blue: 'colorBlue',
  green: 'colorGreen',
  orange: 'colorOrange',
  purple: 'colorPurple',
  teal: 'colorTeal',
  pink: 'colorPink',
  indigo: 'colorIndigo',
  yellow: 'colorYellow',
  gray: 'colorGray',
}

export interface TagItemTag {
  id: string
  name: string
  color: string
}

export interface TagItemProps {
  /** タグデータ */
  tag: TagItemTag
  /** 選択状態 */
  selected?: boolean
  /** クリックハンドラ */
  onClick: () => void
  /** ダブルクリックハンドラ（名前編集開始など） */
  onDoubleClick?: () => void
  /** キーダウンハンドラ */
  onKeyDown?: (e: React.KeyboardEvent) => void
  /** 右クリックハンドラ */
  onContextMenu?: (e: React.MouseEvent) => void
  /** D&D: ドラッグ開始 */
  onDragStart?: (e: React.DragEvent) => void
  /** D&D: ドラッグオーバー */
  onDragOver?: (e: React.DragEvent) => void
  /** D&D: ドロップ */
  onDrop?: (e: React.DragEvent) => void
  /** 削除ハンドラ */
  onDelete?: () => void
  /** ドラッグ中状態 */
  isDragging?: boolean
  /** ドラッグオーバー状態 */
  isDragOver?: boolean
  /** チェックマークのアクセントカラー */
  checkColor?: 'blue' | 'purple'
}

export function TagItem({
  tag,
  selected = false,
  onClick,
  onDoubleClick,
  onKeyDown,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  onDelete,
  isDragging = false,
  isDragOver = false,
  checkColor = 'blue',
}: TagItemProps) {
  const buttonClassNames = [
    styles.button,
    isDragging ? styles.dragging : '',
    isDragOver ? styles.dragOver : '',
  ]
    .filter(Boolean)
    .join(' ')

  const checkboxClassNames = [
    styles.checkbox,
    selected
      ? checkColor === 'purple'
        ? styles.checkboxSelectedPurple
        : styles.checkboxSelectedBlue
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const colorDotKey = TAG_COLOR_CLASS_MAP[tag.color] || 'colorGray'
  const colorDotClassNames = `${styles.colorDot} ${styles[colorDotKey]}`

  return (
    <div data-component="TagItem" className={styles.wrapper}>
      <button
        draggable
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={buttonClassNames}
      >
        {/* チェックマーク */}
        <span className={checkboxClassNames}>
          {selected && (
            <svg className={styles.checkIcon} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        {/* カラードット */}
        <span className={colorDotClassNames} />
        {/* タグ名 */}
        <span className={styles.name}>{tag.name}</span>
      </button>
      {/* 削除ボタン */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className={styles.deleteButton}
        >
          <Icon name="trash" size={12} />
        </button>
      )}
    </div>
  )
}

/** 利用可能なタグ色オプション */
export const TAG_COLOR_OPTIONS = ['red', 'blue', 'green', 'orange', 'purple', 'teal', 'pink', 'indigo', 'yellow']

/** タグ色 → Tailwind bg クラス変換（アプリ側での利用向け） */
const TAG_COLOR_BG_MAP: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-500',
}

export function getTagBgColor(color: string): string {
  return TAG_COLOR_BG_MAP[color] || 'bg-gray-500'
}
