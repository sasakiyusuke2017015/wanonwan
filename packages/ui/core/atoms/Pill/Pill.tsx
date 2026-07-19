import type { ReactNode } from 'react'

import { cn } from '../../utils/cn'

export interface PillProps {
  children: ReactNode
  /**
   * 配色を表す className（例 `'bg-indigo-100 text-indigo-700'`）。
   * 項目ごとに動的生成する色などはここで渡す。未指定は muted。
   */
  colorClassName?: string
  /** padding / font-weight などの微調整用の追加 className。 */
  className?: string
}

/**
 * 角丸の小さなラベル pill。`bg-X-100 text-X-700` のような soft トーンのラベルを
 * アプリ横断で同じ形状（rounded-full / px-2 / text 極小 / semibold）に揃えるための素片。
 *
 * 配色は業務都合（項目→色マップ等）で動的に決まるため className で渡す設計。
 * 固定の semantic 状態には `Badge` / `StatusPill` を使う。
 */
export function Pill({
  children,
  colorClassName = 'bg-muted text-muted-foreground',
  className = '',
}: PillProps) {
  return (
    <span
      className={cn(
        'flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold',
        colorClassName,
        className,
      )}
      data-component="pill"
    >
      {children}
    </span>
  )
}
