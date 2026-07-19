import { FC, ReactNode } from 'react'

export type StatusPillTone = 'success' | 'info' | 'neutral' | 'warning' | 'danger'

const TONE_STYLES: Record<StatusPillTone, { dot: string; color: string; bg: string; border: string }> = {
  success: { dot: '#16a34a', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  info: { dot: '#2563eb', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  neutral: { dot: '#9ca3af', color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' },
  warning: { dot: '#d97706', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  danger: { dot: '#dc2626', color: '#b91c1c', bg: '#fef2f2', border: '#fee2e2' },
}

export interface StatusPillProps {
  /** 配色トーン */
  tone?: StatusPillTone
  /** 表示ラベル（children でも可） */
  label?: ReactNode
  children?: ReactNode
  /** ステータスドットを表示するか */
  showDot?: boolean
  className?: string
}

/**
 * StatusPill - ドット付きのステータス表示 pill
 *
 * Badge と違い、左にステータスドットを持つ丸型 pill。
 * 「有効」「未受験（受験可能）」のような状態表示に使う。
 *
 * Usage:
 * <StatusPill tone="success" label="有効" />
 */
export const StatusPill: FC<StatusPillProps> = ({
  tone = 'neutral',
  label,
  children,
  showDot = true,
  className = '',
}) => {
  const s = TONE_STYLES[tone]
  const content = children ?? label
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
      data-component="status-pill"
      data-tone={tone}
    >
      {showDot && (
        <span
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: s.dot }}
          aria-hidden="true"
        />
      )}
      {content}
    </span>
  )
}
