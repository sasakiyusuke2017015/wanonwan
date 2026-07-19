import { FC, ReactNode } from 'react'

export interface SectionHeadingProps {
  /** 見出しテキスト */
  title: string
  /** 件数バッジ（指定時のみ表示） */
  count?: number
  /** 見出し右に並べる追加要素（任意） */
  trailing?: ReactNode
  className?: string
}

/**
 * SectionHeading - セクション見出し + 件数バッジ
 *
 * 管理画面のフォーム/一覧のセクション区切りに使う。
 *
 * Usage:
 * <SectionHeading title="受講可能コース" count={3} />
 */
export const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  count,
  trailing,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      data-component="section-heading"
    >
      <h2 className="m-0 text-sm font-bold tracking-tight text-gray-900">{title}</h2>
      {count != null && (
        <span
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-[11.5px] font-bold tabular-nums text-gray-500"
          data-component="section-heading-count"
        >
          {count}
        </span>
      )}
      {trailing && <span className="ml-auto">{trailing}</span>}
    </div>
  )
}
