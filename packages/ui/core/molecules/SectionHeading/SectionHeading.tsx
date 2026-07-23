import { FC, ReactNode } from 'react'

export interface SectionHeadingProps {
  /** 見出しテキスト */
  title: string
  /**
   * カード通し番号。複数カードを縦に積む長いフォームで現在地を示す (指定時のみ表示)。
   * 番号付きは見出しがひと回り大きくなる (フォームカードの正準スタイル)。
   */
  number?: number
  /** タイトル下の補足説明 (指定時のみ表示) */
  subtitle?: string
  /** 件数バッジ（指定時のみ表示） */
  count?: number
  /** 右端の補足ピル (例 '任意項目含む'。指定時のみ表示) */
  note?: string
  /** 見出し右に並べる追加要素（任意） */
  trailing?: ReactNode
  className?: string
}

/**
 * SectionHeading - セクション見出し + 件数バッジ / カード番号
 *
 * 管理画面のフォーム/一覧のセクション区切りに使う。複数カードの長いフォーム
 * (コース / 認定試験の新規・編集) では `number` + `subtitle` で番号付きカード見出しにする。
 *
 * Usage:
 * <SectionHeading title="受講可能コース" count={3} />
 * <SectionHeading number={1} title="基本情報" subtitle="コースの顔になる項目" note="任意項目含む" />
 */
export const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  number,
  subtitle,
  count,
  note,
  trailing,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      data-component="section-heading"
    >
      {number != null && (
        <span
          className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg bg-primary/10 text-[13px] font-bold text-primary"
          data-component="section-heading-number"
        >
          {number}
        </span>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2
            className={`m-0 font-bold tracking-tight text-gray-900 ${
              number != null ? 'text-[15px]' : 'text-sm'
            }`}
          >
            {title}
          </h2>
          {count != null && (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-[11.5px] font-bold tabular-nums text-gray-500"
              data-component="section-heading-count"
            >
              {count}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {(note || trailing) && (
        <span className="ml-auto flex flex-none items-center gap-2">
          {note && (
            <span
              className="rounded-full border border-border px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground"
              data-component="section-heading-note"
            >
              {note}
            </span>
          )}
          {trailing}
        </span>
      )}
    </div>
  )
}
