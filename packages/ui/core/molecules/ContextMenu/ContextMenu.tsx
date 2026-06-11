'use client'

/**
 * ContextMenu - 右クリックコンテキストメニュー
 *
 * 任意の位置に表示できる汎用コンテキストメニュー。
 * クリックまたはEscapeで閉じる。
 */

import { useEffect } from 'react'

import styles from './ContextMenu.module.scss'

export interface ContextMenuItem {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

export interface ContextMenuProps {
  /** メニューの表示位置 */
  position: { x: number; y: number }
  /** メニュー項目 */
  items: ContextMenuItem[]
  /** メニューを閉じるコールバック */
  onClose: () => void
}

export function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose()
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      data-component="ContextMenu"
      className={styles.menu}
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            item.onClick()
            onClose()
          }}
          className={`${styles.item} ${item.variant === 'danger' ? styles.itemDanger : ''}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
