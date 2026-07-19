import type { ReactNode } from 'react'

export interface SidebarNavGroupProps {
  label?: string
  collapsed?: boolean
  children: ReactNode
  className?: string
}

export function SidebarNavGroup({
  label,
  collapsed = false,
  children,
  className,
}: SidebarNavGroupProps) {
  return (
    <div className={className}>
      {label && !collapsed && (
        <div className="mb-1.5 -mx-2">
          <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40 border-t-[3px] border-sidebar-border/90 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.35)]">
            <span className="mt-1.5 block px-5">{label}</span>
          </p>
        </div>
      )}
      {label && collapsed && (
        <p className="sr-only">{label}</p>
      )}
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}
