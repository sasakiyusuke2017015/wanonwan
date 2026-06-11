'use client'

import { FC, ReactNode, useRef, useEffect, useState } from 'react'

import { colors } from '../../tokens'

export interface DropdownProps {
  /** トリガー要素 */
  trigger: ReactNode
  /** ドロップダウンコンテンツ */
  children: ReactNode
  /** 幅 */
  width?: number | string
  /** 最大高さ（スクロール時） */
  maxHeight?: number | string
  className?: string
}

/**
 * Dropdown - ドロップダウンメニュー
 *
 * Usage:
 * <Dropdown
 *   trigger={<button>メニュー</button>}
 *   width={200}
 * >
 *   <DropdownItem onClick={...}>項目1</DropdownItem>
 *   <DropdownItem onClick={...}>項目2</DropdownItem>
 * </Dropdown>
 */
export const Dropdown: FC<DropdownProps> = ({
  trigger,
  children,
  width = 192,
  maxHeight,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 外部クリックで閉じる
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const id = requestAnimationFrame(() => {
      document.addEventListener('click', handler)
    })
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('click', handler)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className="absolute z-50 mt-1 border rounded-lg shadow-lg overflow-y-auto"
          style={{
            width,
            maxHeight,
            backgroundColor: colors.white,
            borderColor: colors.gray[200],
          }}
          data-component="dropdown-menu"
        >
          {children}
        </div>
      )}
    </div>
  )
}

export interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  isSelected?: boolean
  disabled?: boolean
  className?: string
}

/**
 * DropdownItem - ドロップダウン項目
 */
export const DropdownItem: FC<DropdownItemProps> = ({
  children,
  onClick,
  isSelected = false,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${className}`}
      style={{
        fontWeight: isSelected ? 500 : undefined,
        color: isSelected ? '#1d4ed8' : disabled ? colors.gray[400] : colors.gray[600],
        backgroundColor: isSelected ? '#eff6ff' : undefined,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      data-component="dropdown-item"
      data-selected={isSelected || undefined}
    >
      {children}
    </button>
  )
}

export interface DropdownDividerProps {
  className?: string
}

/**
 * DropdownDivider - 区切り線
 */
export const DropdownDivider: FC<DropdownDividerProps> = ({ className = '' }) => {
  return (
    <div
      className={className}
      style={{ borderBottom: `1px solid ${colors.gray[100]}` }}
      data-component="dropdown-divider"
    />
  )
}

export default Dropdown
