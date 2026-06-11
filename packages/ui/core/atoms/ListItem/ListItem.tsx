'use client'

import { FC, ReactNode, CSSProperties } from 'react'

import { colors } from '../../tokens'

export interface ListItemProps {
  children: ReactNode
  /** 選択状態（青背景 + 太ボーダー） */
  isSelected?: boolean
  /** アクティブ状態（薄いボーダーのみ） */
  isActive?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  className?: string
  /** ドラッグ可能 */
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

/**
 * ListItem - リストアイテムの基本スタイル
 *
 * - isSelected: 青背景 + 左ボーダー（選択中）
 * - isActive: 薄いボーダーのみ（フォーカス中）
 * - hover: グレー背景
 *
 * Usage:
 * <ListItem isSelected onClick={...}>
 *   <div>コンテンツ</div>
 * </ListItem>
 */
export const ListItem: FC<ListItemProps> = ({
  children,
  isSelected = false,
  isActive = false,
  onClick,
  onDoubleClick,
  className = '',
  draggable,
  onDragStart,
}) => {
  const getStyle = (): CSSProperties => {
    if (isSelected) {
      return {
        backgroundColor: '#eff6ff',
        borderLeftWidth: 2,
        borderLeftStyle: 'solid',
        borderLeftColor: colors.semantic.info,
      }
    }
    if (isActive) {
      return {
        borderLeftWidth: 2,
        borderLeftStyle: 'solid',
        borderLeftColor: colors.gray[300],
      }
    }
    return {
      borderLeftWidth: 2,
      borderLeftStyle: 'solid',
      borderLeftColor: 'transparent',
    }
  }

  return (
    <div
      className={`group px-3 py-2.5 hover:bg-gray-100 transition-colors cursor-pointer ${className}`}
      style={getStyle()}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
      data-component="list-item"
      data-selected={isSelected || undefined}
      data-active={isActive || undefined}
    >
      {children}
    </div>
  )
}

