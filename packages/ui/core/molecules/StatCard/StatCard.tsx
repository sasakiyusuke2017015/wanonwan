import type { ReactNode } from 'react'

import { Card, CardBody } from '../Card'

export interface StatCardProps {
  /** ラベル左のアイコン (例: <Icon name="users" size={16} />) */
  icon: ReactNode
  label: string
  value: string | number
  /** 値の後ろに付ける単位 (例: '件' '%' '名') */
  unit?: string
  /** 値の下の補足説明 */
  sub?: string
  className?: string
}

/**
 * 一覧ページ上部に並べるサマリ統計カード (件数・割合などの KPI 表示)。
 * グリッド配置 (grid-cols-*) は呼び出し側のレイアウト責務。
 */
export function StatCard({ icon, label, value, unit, sub, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardBody className="py-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          {label}
        </div>
        <p className="text-[27px] font-bold leading-none tabular-nums">
          {value}
          {unit && <small className="ml-1 text-sm font-semibold text-muted-foreground">{unit}</small>}
        </p>
        {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
      </CardBody>
    </Card>
  )
}
