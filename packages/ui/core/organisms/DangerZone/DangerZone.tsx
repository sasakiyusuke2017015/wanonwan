'use client'

import type { FC, ReactNode } from 'react'

import { Icon, type AnyIconName } from '../../atoms/Icon'
import { Button } from '../../molecules/Button'

type DangerZoneItemTone = 'danger' | 'success'
type DangerZoneActionVariant = 'danger' | 'success' | 'outline'

export interface DangerZoneItemProps {
  icon: AnyIconName
  /** アイコンの色味。既定 danger (destructive)。有効化など回復系アクションは success。 */
  tone?: DangerZoneItemTone
  title: string
  description: string
  actionLabel: string
  /** アクションボタンの variant。既定 danger。 */
  actionVariant?: DangerZoneActionVariant
  actionIcon?: AnyIconName
  onAction: () => void
  disabled?: boolean
  /** disabled のときにボタンの下へ出す理由テキスト (例: 「下書きに戻すと削除できます」)。 */
  disabledReason?: string
  /** 実行中。ボタンを disabled にしスピナーを出す。 */
  loading?: boolean
}

const ICON_TONE_CLASS: Record<DangerZoneItemTone, string> = {
  danger: 'text-destructive/70',
  success: 'text-green-600',
}

const DangerZoneItem: FC<DangerZoneItemProps> = ({
  icon,
  tone = 'danger',
  title,
  description,
  actionLabel,
  actionVariant = 'danger',
  actionIcon,
  onAction,
  disabled = false,
  disabledReason,
  loading = false,
}) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Icon name={icon} size={16} className={`shrink-0 ${ICON_TONE_CLASS[tone]}`} />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        variant={actionVariant}
        size="small"
        leftIcon={actionIcon}
        onClick={onAction}
        disabled={disabled || loading}
        loading={loading}
      >
        {actionLabel}
      </Button>
      {disabled && disabledReason && (
        <span className="text-xs text-muted-foreground">{disabledReason}</span>
      )}
    </div>
  </div>
)

export interface DangerZoneProps {
  /** セクション見出し。既定「⚠ 危険な操作」。 */
  title?: string
  children: ReactNode
}

/**
 * 破壊的・不可逆な操作 (削除 / 非公開化 / 無効化など) をページ下部に集約するセクション。
 * 順方向の日常操作 (公開する等) はここに入れず、通常のアクションとして置く。
 * 確認ダイアログは持たない (onAction 側で ConfirmDialog を開く)。
 */
type DangerZoneComponent = FC<DangerZoneProps> & { Item: FC<DangerZoneItemProps> }

export const DangerZone: DangerZoneComponent = ({ title = '⚠ 危険な操作', children }) => (
  <section className="space-y-2">
    <h2 className="text-sm font-semibold text-red-600">{title}</h2>
    <div className="divide-y divide-destructive/20 rounded-md border border-destructive/20">
      {children}
    </div>
  </section>
)

DangerZone.Item = DangerZoneItem
