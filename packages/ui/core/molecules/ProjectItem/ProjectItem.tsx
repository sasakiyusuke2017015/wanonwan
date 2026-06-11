'use client'

/**
 * ProjectItem - プロジェクトツリーアイテム
 *
 * ドラッグ可能なプロジェクトアイテム。
 * ツリー表示対応（インデント、接続線）。
 */

import { Icon } from '@ui-catalog/core/atoms'

import styles from './ProjectItem.module.scss'

export interface ProjectItemProject {
  id: string
  name: string
  depth?: number
  parent_id?: string | null
}

export interface ProjectItemProps {
  /** プロジェクトデータ */
  project: ProjectItemProject
  /** 選択状態 */
  selected?: boolean
  /** クリックハンドラ */
  onClick: () => void
  /** ダブルクリックハンドラ（名前編集開始など） */
  onDoubleClick?: () => void
  /** キーダウンハンドラ（F2で編集など） */
  onKeyDown?: (e: React.KeyboardEvent) => void
  /** 右クリックハンドラ */
  onContextMenu?: (e: React.MouseEvent) => void
  /** D&D: ドラッグ開始 */
  onDragStart?: (e: React.DragEvent) => void
  /** D&D: ドラッグオーバー */
  onDragOver?: (e: React.DragEvent) => void
  /** D&D: ドロップ */
  onDrop?: (e: React.DragEvent) => void
  /** D&D: ドラッグ終了 */
  onDragEnd?: (e: React.DragEvent) => void
  /** D&D: ドラッグリーブ */
  onDragLeave?: (e: React.DragEvent) => void
  /** 削除ハンドラ */
  onDelete?: () => void
  /** ドラッグ中状態 */
  isDragging?: boolean
  /** ドラッグオーバー状態 */
  isDragOver?: boolean
  /** ドロップターゲット状態（子にする） */
  isDropTarget?: boolean
  /** ミーティングのドロップターゲット状態 */
  isMeetingDropTarget?: boolean
  /** 同階層の最後の子かどうか（ツリー線描画用） */
  isLastChild?: boolean
}

export function ProjectItem({
  project,
  selected = false,
  onClick,
  onDoubleClick,
  onKeyDown,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDragLeave,
  onDelete,
  isDragging = false,
  isDragOver = false,
  isDropTarget = false,
  isMeetingDropTarget = false,
  isLastChild = false,
}: ProjectItemProps) {
  const depth = project.depth ?? 0

  const buttonClassNames = [
    styles.button,
    selected ? styles.selected : '',
    isDragging ? styles.dragging : '',
    isDragOver ? styles.dragOver : '',
    isDropTarget ? styles.dropTarget : '',
    isMeetingDropTarget ? styles.meetingDropTarget : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div data-component="ProjectItem" className={styles.wrapper}>
      {/* ツリー補助線（子プロジェクトのみ） */}
      {depth > 0 && (
        <>
          {/* 縦線（親からの接続） */}
          <div
            className={styles.verticalLine}
            style={{
              left: (depth - 1) * 16 + 6,
              top: 0,
              bottom: isLastChild ? '50%' : 0,
            }}
          />
          {/* 横線（アイテムへの接続） */}
          <div
            className={styles.horizontalLine}
            style={{
              left: (depth - 1) * 16 + 6,
              top: '50%',
              width: 10,
            }}
          />
        </>
      )}
      <button
        draggable
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onDragLeave={onDragLeave}
        style={{ paddingLeft: 6 + depth * 14 }}
        className={buttonClassNames}
      >
        <Icon name="folder" size={13} className={styles.icon} />
        <span className={styles.name}>{project.name}</span>
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
