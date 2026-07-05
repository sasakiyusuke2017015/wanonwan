'use client'

import { useState, useId, useCallback, type ReactNode } from 'react'

import { useOperationLog } from '../../../infra/devtools'

import styles from './Toggleable.module.scss'

interface ToggleableState {
  isOpen: boolean
  toggle: () => void
  contentId: string
  /** trigger 要素に展開すると aria-expanded / aria-controls がセットできる */
  triggerProps: {
    type: 'button'
    'aria-expanded': boolean
    'aria-controls': string
    onClick: () => void
  }
}

interface ToggleableProps {
  /** 初期表示状態（非制御モード用） */
  defaultOpen?: boolean
  /** 開閉状態（制御モード用：指定すると controlled component になる） */
  isOpen?: boolean
  /** 開閉時 callback */
  onToggle?: (isOpen: boolean) => void
  /** trigger render-prop。返した要素が「クリックで開閉する UI」になる */
  renderTrigger: (state: ToggleableState) => ReactNode
  /** 開いた時に表示する中身 */
  children: ReactNode
  /** devtools ログ用ラベル (default: 'toggleable') */
  logLabel?: string
}

/**
 * 開閉ロジックだけを持つ headless primitive。
 *
 * 視覚クローム (border / 背景 / card / margin / padding 等) は呼び出し側で持つ。
 * `ToggleableSection` のような "Section 風の見た目付き" コンポーネントはこれを
 * 内部で使い、Section 視覚層だけを上に重ねる構造にする。
 *
 * trigger は `renderTrigger` 経由で呼び出し側が描画する。controlled / uncontrolled
 * の両モードに対応。`children` は開いた時に slide / fade で表示される。
 */
export function Toggleable({
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  renderTrigger,
  children,
  logLabel = 'toggleable',
}: ToggleableProps) {
  const isControlled = controlledIsOpen !== undefined
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const [contentKey, setContentKey] = useState(0)
  const contentId = useId()
  const log = useOperationLog('Toggleable')

  const toggle = useCallback(() => {
    const newIsOpen = !isOpen
    log(newIsOpen ? 'expand' : 'collapse', { label: logLabel })
    if (!isControlled) {
      setInternalIsOpen(newIsOpen)
    }
    if (newIsOpen) {
      setContentKey((prev) => prev + 1)
    }
    onToggle?.(newIsOpen)
  }, [isControlled, isOpen, logLabel, log, onToggle])

  const state: ToggleableState = {
    isOpen,
    toggle,
    contentId,
    triggerProps: {
      type: 'button',
      'aria-expanded': isOpen,
      'aria-controls': contentId,
      onClick: toggle,
    },
  }

  const collapseClasses = [
    styles.collapse,
    isOpen ? styles['collapse--open'] : styles['collapse--closed'],
  ].join(' ')

  const contentClasses = [
    styles.content,
    isOpen ? styles['content--open'] : styles['content--closed'],
  ].join(' ')

  return (
    <div data-component="toggleable">
      {renderTrigger(state)}
      <div id={contentId} className={collapseClasses}>
        <div key={contentKey} className={contentClasses}>
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Toggleable と同じ controlled / uncontrolled 開閉ロジックを hook として使う。
 *
 * trigger UI を独自に書きたく、`renderTrigger` の中ではなく外側で開閉状態を
 * 参照したいケース用 (例: trigger と content が DOM 上離れている)。
 */
export function useToggleable({
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  logLabel = 'toggleable',
}: {
  defaultOpen?: boolean
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  logLabel?: string
} = {}): { isOpen: boolean; toggle: () => void; contentId: string } {
  const isControlled = controlledIsOpen !== undefined
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const contentId = useId()
  const log = useOperationLog('useToggleable')

  const toggle = useCallback(() => {
    const newIsOpen = !isOpen
    log(newIsOpen ? 'expand' : 'collapse', { label: logLabel })
    if (!isControlled) {
      setInternalIsOpen(newIsOpen)
    }
    onToggle?.(newIsOpen)
  }, [isControlled, isOpen, logLabel, log, onToggle])

  return { isOpen, toggle, contentId }
}

export type { ToggleableProps, ToggleableState }
