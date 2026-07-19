'use client'

import type { ElementType, ReactNode } from 'react'

import { ScrollArea } from '../../atoms/ScrollArea'
import { SidebarNavGroup } from '../../molecules/SidebarNavGroup'
import { SidebarNavItem } from '../../molecules/SidebarNavItem'
import { cn } from '../../utils'

export interface SidebarNavItemModel<IconKey extends string> {
  href: string
  label: string
  icon: IconKey
  comingSoon?: boolean
}

export interface SidebarNavGroupModel<IconKey extends string> {
  id: string
  label?: string
  items: ReadonlyArray<SidebarNavItemModel<IconKey>>
}

export interface SidebarNavProps<IconKey extends string> {
  groups: ReadonlyArray<SidebarNavGroupModel<IconKey>>
  activeHref: string
  collapsed?: boolean
  resolveIcon: (key: IconKey) => ReactNode
  linkComponent?: ElementType
  className?: string
}

function matchesHref(activeHref: string, href: string): boolean {
  return activeHref === href || activeHref.startsWith(href + '/')
}

// 現在の pathname に前方一致する href のうち最長のものだけを返す。
// 兄弟ページが親配下にネストした URL (例: /exams と /exams/history) で、
// /exams/history を開いたときに親の /exams まで誤ってアクティブになるのを防ぐ。
function resolveActiveHref<IconKey extends string>(
  groups: ReadonlyArray<SidebarNavGroupModel<IconKey>>,
  activeHref: string,
): string | null {
  return groups
    .flatMap((g) => g.items)
    .map((it) => it.href)
    .filter((href) => matchesHref(activeHref, href))
    .reduce<string | null>(
      (longest, href) => (longest === null || href.length > longest.length ? href : longest),
      null,
    )
}

export function SidebarNav<IconKey extends string>({
  groups,
  activeHref,
  collapsed = false,
  resolveIcon,
  linkComponent,
  className,
}: SidebarNavProps<IconKey>) {
  const resolvedActiveHref = resolveActiveHref(groups, activeHref)
  return (
    <ScrollArea as="nav" scrollbar="thin" className={cn('space-y-3 px-2 py-3', className)}>
      {groups.map((g) => (
        <SidebarNavGroup key={g.id} label={g.label} collapsed={collapsed}>
          {g.items.map((it) => (
            <li key={it.href}>
              <SidebarNavItem
                linkComponent={linkComponent}
                href={it.href}
                label={it.label}
                icon={resolveIcon(it.icon)}
                active={it.href === resolvedActiveHref}
                collapsed={collapsed}
                comingSoon={it.comingSoon}
              />
            </li>
          ))}
        </SidebarNavGroup>
      ))}
    </ScrollArea>
  )
}
