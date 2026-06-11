'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ProfileMenu.module.scss'

export interface ProfileMenuItem {
  readonly key: string
  readonly label: string
  readonly onClick: () => void
  readonly tone?: 'default' | 'danger'
}

export interface ProfileMenuProps {
  /** 表示文字（イニシャル1文字など） */
  readonly initial: string
  /** メニュー上部の情報行（例: ログイン中のメール） */
  readonly infoLine?: React.ReactNode
  readonly items: readonly ProfileMenuItem[]
  readonly ariaLabel?: string
  readonly className?: string
}

/**
 * 丸アイコン + クリックで開くドロップダウンメニュー。
 * 認証状態の判定は呼び出し側（未ログイン時は別コンポーネント）。
 */
export function ProfileMenu({
  initial,
  infoLine,
  items,
  ariaLabel = 'プロフィールメニュー',
  className,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [open])

  return (
    <div ref={rootRef} className={`${styles.root}${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {initial}
      </button>
      {open && (
        <div role="menu" className={styles.menu}>
          {infoLine && <div className={styles.info}>{infoLine}</div>}
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              role="menuitem"
              className={styles.item}
              data-tone={it.tone ?? 'default'}
              onClick={() => {
                setOpen(false)
                it.onClick()
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfileMenu
