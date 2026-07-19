import { FC, ReactNode } from 'react'

export interface AdminPageHeaderProps {
  /** タイトル左のアイコン（丸い枠の中に表示） */
  icon?: ReactNode
  /** ページタイトル */
  title: string
  /** タイトル右に並べるステータス（StatusPill 等） */
  status?: ReactNode
  /** タイトル下に表示する補助テキスト（ID 等） */
  subtitle?: ReactNode
  /** 右側に並べるアクション */
  actions?: ReactNode
  /** 淡いグラデーション背景にする */
  gradient?: boolean
  className?: string
}

/**
 * AdminPageHeader - 管理画面のページヘッダー帯
 *
 * アイコン丸 + タイトル + ステータス + 補助テキスト + アクションを
 * 全幅の帯として表示する。
 *
 * Usage:
 * <AdminPageHeader
 *   icon={<UserIcon />}
 *   title="管理 太郎"
 *   status={<StatusPill tone="success" label="有効" />}
 *   subtitle="ID: USR-00000001"
 * />
 */
export const AdminPageHeader: FC<AdminPageHeaderProps> = ({
  icon,
  title,
  status,
  subtitle,
  actions,
  gradient = false,
  className = '',
}) => {
  return (
    <header
      className={`border-b border-gray-200 ${
        gradient ? 'bg-gradient-to-b from-white to-gray-50' : 'bg-white'
      } ${className}`}
      data-component="admin-page-header"
    >
      <div className="flex items-center gap-3.5 px-6 py-4">
        {icon && (
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="m-0 truncate text-lg font-bold tracking-tight text-gray-900">{title}</h1>
            {status}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-xs tabular-nums text-gray-500">{subtitle}</div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
