'use client'

import { MouseEvent } from 'react'

import { Icon, type AnyIconName } from '../../atoms/Icon'
import { Tooltip } from '../../atoms/Tooltip'
import { isModifiedClick } from '../../utils'

import styles from './PageHeaderIconNav.module.scss'

export interface PageHeaderIconNavItem {
  icon: AnyIconName
  /** tooltip と aria-label に使う名称（必須。アイコンだけでは意味が伝わらないため）。 */
  label: string
  href: string
  /**
   * 渡すと通常クリックを preventDefault してこちらを呼ぶ（呼び出し側の SPA 遷移用）。
   * Ctrl/⌘/中クリックの別タブ等はブラウザネイティブ動作に委ねる。
   */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export interface PageHeaderIconNavProps {
  items: PageHeaderIconNavItem[]
  className?: string
}

/**
 * PageHeaderIconNav - ページヘッダー右上のアイコンナビゲーション
 *
 * 「一覧に戻る」「対象ユーザー」など、ページに紐づく移動先をアイコン + tooltip で
 * 横並びに出す。AdminPageHeader の `actions` スロットに置く前提。
 * どの item を出すか（admin 限定等）は呼び出し側の business logic で判断する。
 *
 * Usage:
 * <AdminPageHeader
 *   title="認定試験を編集"
 *   actions={
 *     <PageHeaderIconNav
 *       items={[
 *         { icon: 'users', label: '対象ユーザー', href: `/exams/${id}/targets` },
 *         { icon: 'arrow-left', label: '一覧に戻る', href: '/exams' },
 *       ]}
 *     />
 *   }
 * />
 */
export function PageHeaderIconNav({ items, className }: PageHeaderIconNavProps) {
  if (items.length === 0) return null

  return (
    <nav
      className={[styles.nav, className].filter(Boolean).join(' ')}
      aria-label="ページナビゲーション"
      data-component="page-header-icon-nav"
    >
      {items.map((item) => (
        <Tooltip key={`${item.href}:${item.label}`} content={item.label} position="bottom">
          <a
            href={item.href}
            aria-label={item.label}
            className={styles.link}
            onClick={
              item.onClick
                ? (e) => {
                    if (isModifiedClick(e)) return
                    e.preventDefault()
                    item.onClick?.(e)
                  }
                : undefined
            }
          >
            <Icon name={item.icon} size={18} />
          </a>
        </Tooltip>
      ))}
    </nav>
  )
}
