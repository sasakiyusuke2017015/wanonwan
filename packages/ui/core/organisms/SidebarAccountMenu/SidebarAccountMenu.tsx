'use client'

import type { ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import { cn } from '../../utils'
import { DropdownMenu } from '../DropdownMenu'

/**
 * popover 内の統一感ある menu item ボタン。
 *   - rounded-lg、padding を全アイテムで統一
 *   - active: 青背景 + 青文字
 *   - disabled: 半透明 + cursor-not-allowed
 */
function PopoverItem({
  icon,
  label,
  trailing,
  active = false,
  disabled = false,
  destructive = false,
  onClick,
}: {
  icon?: ReactNode
  label: string
  trailing?: ReactNode
  active?: boolean
  disabled?: boolean
  destructive?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // active 時は左 2px の青ボーダーで「選択中」を視覚的に強調 (色だけだと埋もれるため)
        'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150',
        active && 'cursor-default bg-blue-50 font-semibold text-blue-700 shadow-[inset_2px_0_0_0_rgb(59,130,246)]',
        // hover を 1 段濃くして可視性向上 (gray-100 / red-50 は白背景に溶けすぎ)。
        // active と同系統の blue-50 は使わない (active との視覚差別化のため)。
        !active && !destructive && 'text-gray-700 hover:bg-gray-200 hover:text-gray-900',
        !active && destructive && 'text-gray-700 hover:bg-red-100 hover:text-red-700',
        disabled && !active && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-gray-700',
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center',
            active ? 'text-blue-600' : 'text-gray-500',
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {trailing && (
        <span className={cn('shrink-0 text-xs', active ? 'text-blue-600' : 'text-gray-500')}>
          {trailing}
        </span>
      )}
    </button>
  )
}

export interface SidebarAccountMenuItem {
  /** onAction に渡す汎用 action ID (catalog は中身を解釈しない) */
  id: string
  label: string
  icon?: ReactNode
  trailing?: ReactNode
  active?: boolean
  disabled?: boolean
  destructive?: boolean
}

export interface SidebarAccountMenuSection {
  id: string
  title?: string
  /** true: active item に check アイコン、他は同幅 placeholder (役職切替リスト用) */
  showCheck?: boolean
  items: ReadonlyArray<SidebarAccountMenuItem>
  /** section 直下に出すエラー行 (role="alert") */
  error?: string | null
}

/**
 * trigger の見せ方と popover の展開方向。
 *   - 'sidebar': 全幅のプロファイル行 + 上方向 popover (Sidebar 下部の既定)
 *   - 'topbar':  avatar のみの compact trigger + 下方向 popover
 *
 * Sidebar を出さない画面幅 (モバイル等) でも同じアカウントメニューへ到達させるための
 * 配置切替。popover の中身 (sections / showCheck / error) は配置によらず共通。
 */
export type SidebarAccountMenuPlacement = 'sidebar' | 'topbar'

export interface SidebarAccountMenuProps {
  name: string
  email: string
  departmentName?: string | null
  avatarUrl?: string | null
  /** app で解決済みのバッジ表示値 (ロールチップ等)。trigger 行と popover ヘッダに出す */
  badge?: ReactNode
  placement?: SidebarAccountMenuPlacement
  /** 'sidebar' 配置でのみ意味を持つ (折りたたみ時は avatar のみの trigger になる) */
  collapsed?: boolean
  sections: ReadonlyArray<SidebarAccountMenuSection>
  /**
   * item クリック時の callback。閉じるかどうかは app が ctx.closeMenu で制御する
   * (成功時だけ閉じ、失敗時は開いたままエラー表示、が再現できる)。
   */
  onAction: (id: string, ctx: { closeMenu: () => void }) => void
}

function AvatarCircle({
  avatarUrl,
  initial,
  size,
}: {
  avatarUrl: string | null | undefined
  initial: string
  size: 'trigger' | 'header'
}) {
  return (
    <span
      aria-hidden
      style={size === 'trigger' ? { width: 36, height: 36 } : undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-gradient-to-br from-blue-500 to-indigo-600 font-semibold text-white',
        size === 'trigger' && 'text-sm shadow-sm ring-1 ring-white/10',
        size === 'header' && 'relative flex h-14 w-14 text-lg shadow-md ring-2 ring-white',
      )}
    >
      {avatarUrl ? (
        // presigned URL は短期有効で next/image の最適化対象に向かないため素の img
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        // trigger のみ leading-none (36px 円内の垂直センタリング)。header (text-lg) は
        // line box を変えない (旧実装の出力 class と一致させる)
        <span className={size === 'trigger' ? 'leading-none' : undefined}>{initial}</span>
      )}
    </span>
  )
}

/**
 * SidebarAccountMenu — Sidebar 下部の clickable プロファイル trigger + Slack 風 popover。
 *   - expanded: 行全体 (avatar + 名前 + 部署) クリック → popover がアカウント行の真上に開く
 *   - collapsed: avatar のみクリック → popover がアカウント行の真上に開く
 *   - popover 内: ヘッダ (avatar + 名前 + メール + badge) / sections (データ駆動)
 * 業務 (ロール切替 API / logout / 遷移) は知らない。app が sections と onAction で注入する。
 */
export function SidebarAccountMenu({
  name,
  email,
  departmentName,
  avatarUrl,
  badge,
  placement = 'sidebar',
  collapsed = false,
  sections,
  onAction,
}: SidebarAccountMenuProps) {
  const initial = name.charAt(0).toUpperCase() || '?'
  const isTopbar = placement === 'topbar'

  // sidebar: popover はアカウント行の真上に開く (placement='top-start')。
  // crossOffset で横位置を sidebar 幅の 1/3 地点に寄せ、menu を sidebar に
  // 2/3 食い込ませる (左端 = sidebar 幅 × 1/3)。
  // (--sidebar-w-expanded 15rem=240px / --sidebar-w-collapsed 4rem=64px)
  // topbar: trigger の右端を基準に真下へ開くので寄せは不要。
  const menuCrossOffset = isTopbar ? 0 : collapsed ? 21 : 80
  const menuPlacement = isTopbar ? 'bottom-end' : 'top-start'

  // customTrigger で Button molecule をバイパスして完全に layout 制御。
  // avatar 列 36px 固定 + 名前列 1fr の grid layout で sidebar 全幅を使う。
  const renderTrigger = ({
    onClick,
    ariaProps,
  }: {
    onClick: () => void
    isOpen: boolean
    ariaProps: {
      'aria-haspopup': 'true'
      'aria-expanded': boolean
      'aria-controls': string
      'aria-label'?: string
    }
  }) => (
    <button
      type="button"
      onClick={onClick}
      {...ariaProps}
      className={cn(
        'box-border flex items-center transition-all duration-150 active:scale-[0.97] active:duration-75',
        isTopbar
          // topbar は配色を持たない (親の文字色を継承する)。hover も地の色に依存しない半透明で置く。
          ? 'rounded-md p-1 text-current hover:bg-current/10'
          : cn(
              'w-full text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3',
            ),
      )}
    >
      <AvatarCircle avatarUrl={avatarUrl} initial={initial} size="trigger" />
      {!isTopbar && !collapsed && (
        <span className="min-w-0 flex-1 text-left">
          {/* 1 行目: badge + 名前。badge は名前の前 (左) に置いて常時読める。
              badge は shrink-0、name は truncate で sidebar 幅に応じて省略。 */}
          <span className="flex min-w-0 items-center gap-1.5 leading-tight">
            {/* inline-flex: 素の inline span だと leading-tight のストラットが
                Badge 高を超えて行が 1px 膨らむ (before/after 比較で検出) */}
            {badge && <span className="inline-flex shrink-0">{badge}</span>}
            <span className="min-w-0 truncate text-sm font-medium">{name}</span>
          </span>
          {departmentName && (
            <span className="mt-0.5 block truncate text-xs text-sidebar-foreground/60 leading-tight">
              {departmentName}
            </span>
          )}
        </span>
      )}
    </button>
  )

  const menu = (
      <DropdownMenu
        customTrigger={renderTrigger}
        placement={menuPlacement}
        offset={8}
        crossOffset={menuCrossOffset}
        avoidTriggerOverlap={!isTopbar}
        menuWidth="w-[20rem]"
        ariaLabel={
          isTopbar || collapsed ? 'アカウントメニューを開く' : `${name} のアカウントメニュー`
        }
        menuContent={(closeMenu) => (
          <div data-component="SidebarAccountMenu" className="text-gray-900">
            {/* ヘッダ: gradient bg + リング付きアバター + badge */}
            <div className="relative flex items-center gap-3.5 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 px-4 pb-4 pt-5">
              {/* 装飾的グラデーション円 (右上) */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-xl"
                aria-hidden
              />
              <AvatarCircle avatarUrl={avatarUrl} initial={initial} size="header" />
              <div className="relative min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900">{name}</div>
                <div className="truncate text-xs text-gray-600">{email}</div>
                {badge && <div className="mt-1.5">{badge}</div>}
              </div>
            </div>

            {sections.map((section) => (
              <div key={section.id}>
                {/* セクション区切り */}
                <div className="h-px bg-gray-200/70" />
                <div className="p-2">
                  {section.title && (
                    <div className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      {section.title}
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => (
                      <PopoverItem
                        key={item.id}
                        label={item.label}
                        icon={
                          section.showCheck
                            ? item.active
                              ? <Icon name="check" size={16} />
                              : <span className="h-4 w-4" />
                            : item.icon
                        }
                        trailing={item.trailing}
                        active={item.active}
                        disabled={item.disabled}
                        destructive={item.destructive}
                        onClick={() => onAction(item.id, { closeMenu })}
                      />
                    ))}
                  </div>
                  {section.error && (
                    <div
                      role="alert"
                      className="mx-1 mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                    >
                      {section.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      />
  )

  // sidebar は最下部の区切り線付きブロックとして置く。topbar は器を持たない。
  return isTopbar ? menu : <div className="border-t border-sidebar-border">{menu}</div>
}
