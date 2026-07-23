'use client'

// AppShellRoot は <AppShellProvider> の中で sidebarState を読み、
// data-sidebar-state 属性をルート <div> に bind するだけの薄い wrapper。
// tokens.css 側の [data-sidebar-state='collapsed'] / ='expanded' ルールで
// --sidebar-w を切り替え、Sidebar / TopBar / main の幅・offset を同期する。

import { cn } from '../../utils'

import { useAppShell } from './AppShellProvider'

export function AppShellRoot({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { sidebarState } = useAppShell()
  return (
    <div
      data-sidebar-state={sidebarState}
      className={cn('min-h-screen bg-background', className)}
    >
      {children}
    </div>
  )
}
