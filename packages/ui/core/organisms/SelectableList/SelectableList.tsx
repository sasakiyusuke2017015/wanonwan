'use client'

import { ReactNode } from 'react'

import { Checkbox } from '../../atoms/Checkbox'

export interface SelectableListProps<T> {
  /** 行データ */
  items: T[]
  /** 行の React key を返す */
  getKey: (item: T) => string | number
  /** 行が選択中か */
  isSelected: (item: T) => boolean
  /** 行のトグル（チェックボックス変更時に呼ばれる） */
  onToggle: (item: T) => void
  /** 行が無効か（チェックボックスを disabled にする） */
  isDisabled?: (item: T) => boolean
  /** 行の主要表示（左、可変幅） */
  renderPrimary: (item: T) => ReactNode
  /** 行の末尾表示（右、バッジ等） */
  renderTrailing?: (item: T) => ReactNode
  /** items が空のときの文言 */
  emptyMessage?: string
  className?: string
}

/**
 * SelectableList - 枠線付きのチェックボックス選択リスト
 *
 * ロール / 受講可能コース / 受験可能試験など「チェックで選ぶ行リスト」を共通化する。
 * 行全体が <label> なのでどこをクリックしてもトグルする。
 *
 * Usage:
 * <SelectableList
 *   items={roles}
 *   getKey={(r) => r.id}
 *   isSelected={(r) => selected.has(r.id)}
 *   onToggle={(r) => toggle(r.id)}
 *   renderPrimary={(r) => <span>{r.label}</span>}
 *   renderTrailing={(r) => <Badge value={r.level} size="small" />}
 * />
 */
export function SelectableList<T>({
  items,
  getKey,
  isSelected,
  onToggle,
  isDisabled,
  renderPrimary,
  renderTrailing,
  emptyMessage = '対象がありません。',
  className = '',
}: SelectableListProps<T>) {
  return (
    <div
      className={`divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}
      data-component="selectable-list"
    >
      {items.length === 0 ? (
        <p className="p-3 text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        items.map((item) => {
          const selected = isSelected(item)
          const disabled = isDisabled?.(item) ?? false
          return (
            <label
              key={getKey(item)}
              className={`flex min-h-12 items-center gap-3 px-3.5 py-2.5 transition-colors ${
                disabled ? 'cursor-default' : 'cursor-pointer'
              } ${selected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
              data-selected={selected || undefined}
            >
              <Checkbox
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(item)}
              />
              <span className="min-w-0 flex-1">{renderPrimary(item)}</span>
              {renderTrailing && (
                <span className="flex shrink-0 items-center gap-2.5">{renderTrailing(item)}</span>
              )}
            </label>
          )
        })
      )}
    </div>
  )
}
