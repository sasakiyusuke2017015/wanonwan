'use client'

import type { ElementType, ReactNode } from 'react'

import { Animated } from '../../atoms/Animated'
import { Icon } from '../../atoms/Icon'
import { cn } from '../../utils'
import { SidebarNav, type SidebarNavGroupModel } from '../SidebarNav'

export interface SidebarShellBrand {
  /** ブランドロゴのリンク先 (例: '/dashboard') */
  href: string
  /** グラデーションボックス内に出すアイコン (色は catalog 側が付与) */
  icon: ReactNode
  /** 展開時に出すブランド名 */
  label: string
}

export interface SidebarShellProps<IconKey extends string> {
  groups: ReadonlyArray<SidebarNavGroupModel<IconKey>>
  activeHref: string
  collapsed: boolean
  onToggle: () => void
  resolveIcon: (key: IconKey) => ReactNode
  linkComponent?: ElementType
  /** ヘッダー行のブランドロゴ。app はブランド固有 content / link 先のみ注入する */
  brand?: SidebarShellBrand
  /** 最下部 slot (ユーザーメニュー等) */
  footer?: ReactNode
  /** aria-controls の対応先になる aside の id */
  id?: string
  ariaLabel?: string
}

/**
 * SidebarShell — 左ペインの器 (開閉式 collapsible)。
 *   - 展開時 (240px): brand + icon + label + Soon バッジ
 *   - 折りたたみ時 (64px): icon のみ + title=label / aria-label=label
 *   - 幅は CSS 変数 --sidebar-w (AppShellRoot の data-sidebar-state で切替)
 *   - 開閉トグル (PanelLeftClose) はヘッダーに常設。展開時はロゴ右端、折りたたみ時はトグルのみ。
 *     開閉で mount したまま Animated rotate で 180° 回転 + scale する。
 * 開閉状態は持たない (collapsed / onToggle を上位から受ける presentational organism)。
 */
export function SidebarShell<IconKey extends string>({
  groups,
  activeHref,
  collapsed,
  onToggle,
  resolveIcon,
  linkComponent,
  brand,
  footer,
  id = 'app-sidebar',
  ariaLabel = 'メインナビゲーション',
}: SidebarShellProps<IconKey>) {
  const BrandLink: ElementType = linkComponent ?? 'a'

  return (
    <aside
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col',
        'w-[var(--sidebar-w)]',
        'overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        'transition-[width] duration-[var(--shell-transition-duration)] ease-out',
      )}
    >
      {/* Brand + 開閉トグル
          - expanded: brand (アイコン + 名称) 左 / トグル右 (両端揃え)
          - collapsed: brand は隠してトグルのみ中央寄せ */}
      <div
        className={cn(
          'flex h-[var(--topbar-h)] border-b border-sidebar-border',
          collapsed ? 'items-center justify-center px-0' : 'items-center justify-between px-3',
        )}
      >
        {!collapsed && brand && (
          <BrandLink
            href={brand.href}
            className="group flex min-w-0 items-center gap-3 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-sidebar-accent/40"
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sidebar-primary',
                'bg-gradient-to-br from-sidebar-primary/35 to-sidebar-primary/10 ring-1 ring-sidebar-primary/25 shadow-sm',
              )}
              aria-hidden
            >
              {brand.icon}
            </span>
            <span className="whitespace-nowrap text-base font-semibold tracking-tight">
              {brand.label}
            </span>
          </BrandLink>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'サイドバーを開く' : 'サイドバーを折りたたむ'}
          aria-expanded={!collapsed}
          aria-controls={id}
          className={cn(
            'rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
            collapsed ? 'p-0.5' : 'p-1.5',
          )}
        >
          {/* nav アイコンと同じ h-5 w-5。展開=回転 0 / 折りたたみ=180° + scale */}
          <Animated type="rotate" show={!collapsed}>
            <Icon name="panel-left-close" size={20} />
          </Animated>
        </button>
      </div>

      {/* Navigation (scrollable) */}
      <SidebarNav
        groups={groups}
        activeHref={activeHref}
        collapsed={collapsed}
        resolveIcon={resolveIcon}
        linkComponent={linkComponent}
      />

      {/* Footer slot (ユーザーメニュー等) */}
      {footer}
    </aside>
  )
}
