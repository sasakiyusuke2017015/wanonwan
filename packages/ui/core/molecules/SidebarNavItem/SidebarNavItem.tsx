import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { cn } from '../../utils'

export interface SidebarNavItemProps {
  href: string
  label: string
  icon: ReactNode
  active?: boolean
  collapsed?: boolean
  comingSoon?: boolean
  linkComponent?: ElementType
  className?: string
}

type AnchorRest = Omit<
  ComponentPropsWithoutRef<'a'>,
  keyof SidebarNavItemProps | 'children'
>

export function SidebarNavItem({
  href,
  label,
  icon,
  active = false,
  collapsed = false,
  comingSoon = false,
  linkComponent,
  className,
  ...rest
}: SidebarNavItemProps & AnchorRest) {
  const LinkEl: ElementType = linkComponent ?? 'a'

  return (
    <LinkEl
      href={href}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        // click feedback: 押下中に一瞬縮む (Linear / Vercel 系の触感)
        'active:scale-[0.96] active:duration-75',
        collapsed && 'justify-center px-2',
        active
          // active: primary 色の薄いベース + 明るい文字
          ? 'bg-sidebar-primary/15 text-sidebar-foreground'
          // non-active: 薄めの文字、hover で sidebar-accent に
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        className,
      )}
      {...rest}
    >
      {/* active accent bar (expanded のときだけ表示) */}
      {active && !collapsed && (
        <span
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary"
          aria-hidden
        />
      )}
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center transition-colors',
          active
            ? 'text-sidebar-primary'
            : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground',
        )}
      >
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {comingSoon && (
            <span className="ml-2 rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] font-semibold text-sidebar-foreground/60">
              Soon
            </span>
          )}
        </>
      )}
    </LinkEl>
  )
}
