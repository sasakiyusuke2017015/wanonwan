import styles from './MiniCalendarGrid.module.scss'

/** カレンダーセルに表示する任意のバッジ（色付きドット） */
export interface MiniCalendarBadge {
  readonly color?: string
  /** 「done 済み」など非アクティブ化された色味 */
  readonly dimmed?: boolean
}

export interface MiniCalendarCell {
  /** YYYY-MM-DD */
  readonly ymd: string
  readonly day: number
  readonly inMonth: boolean
  readonly isToday: boolean
  readonly isSun: boolean
  readonly isSat: boolean
  /** このセルに立てるバッジ（undefined ならバッジなし） */
  readonly badge?: MiniCalendarBadge | null
  /** ツールチップ */
  readonly title?: string
}

export interface MiniCalendarRow {
  readonly cells: readonly (MiniCalendarCell | null)[]
}

export interface TodayEvent {
  readonly key: string
  readonly href?: string
  readonly title: string
  readonly color: string
  readonly time?: string
  /** 左側のアクセント色バー */
  readonly leading?: React.ReactNode
  /** タイトル接頭辞（✅ や ⏰ など） */
  readonly prefix?: string
}

export interface MiniCalendarGridProps {
  readonly title?: string
  readonly monthLabel: string
  readonly weekdayLabels: readonly string[]
  readonly rows: readonly MiniCalendarRow[]
  readonly todayEventsTitle?: string
  readonly todayEvents?: readonly TodayEvent[]
  /** リンクコンポーネント（Next.js の Link 等）。未指定時は <a> で fallback。 */
  readonly linkAs?: (props: { href: string; children: React.ReactNode; className?: string }) => React.ReactElement
}

/**
 * 汎用ミニカレンダー。
 * データ集計は呼び出し側で行い、表示用に変換して渡す。
 */
export function MiniCalendarGrid({
  title = 'カレンダー',
  monthLabel,
  weekdayLabels,
  rows,
  todayEventsTitle = '今日の予定',
  todayEvents,
  linkAs,
}: MiniCalendarGridProps) {
  const LinkLike = linkAs
  return (
    <aside className={styles.root}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.monthLabel}>{monthLabel}</div>
      <div className={styles.grid}>
        {weekdayLabels.map((w, i) => {
          const cls = [styles.weekday]
          if (i === 0) cls.push(styles.isSun)
          if (i === 6) cls.push(styles.isSat)
          return (
            <div key={`wd-${i}`} className={cls.join(' ')}>
              {w}
            </div>
          )
        })}
        {rows.flatMap((row, ri) =>
          row.cells.map((cell, ci) => {
            if (!cell) {
              return <div key={`e-${ri}-${ci}`} className={`${styles.cell} ${styles.empty}`} />
            }
            const cls = [styles.cell]
            if (!cell.inMonth) cls.push(styles.outOfMonth)
            if (cell.isToday) cls.push(styles.isToday)
            if (cell.isSun) cls.push(styles.isSun)
            if (cell.isSat) cls.push(styles.isSat)
            if (cell.badge) cls.push(styles.hasBadge)
            if (cell.badge?.dimmed) cls.push(styles.badgeDimmed)
            return (
              <div
                key={cell.ymd}
                className={cls.join(' ')}
                title={cell.title}
                style={cell.badge?.color ? ({ ['--badge-color' as string]: cell.badge.color } as React.CSSProperties) : undefined}
              >
                <span className={styles.day}>{cell.day}</span>
              </div>
            )
          })
        )}
      </div>

      {todayEvents && todayEvents.length > 0 && (
        <div className={styles.today}>
          <h4 className={styles.todayLabel}>{todayEventsTitle}</h4>
          <ul className={styles.todayList}>
            {todayEvents.map((ev) => {
              const inner = (
                <>
                  <span className={styles.todayBar} style={{ background: ev.color }} />
                  {ev.time && <span className={styles.todayTime}>{ev.time}</span>}
                  <span className={styles.todayTitle}>
                    {ev.prefix}
                    {ev.title}
                  </span>
                </>
              )
              if (ev.href && LinkLike) {
                return (
                  <li key={ev.key}>
                    <LinkLike href={ev.href}>{inner}</LinkLike>
                  </li>
                )
              }
              if (ev.href) {
                return (
                  <li key={ev.key}>
                    <a href={ev.href}>{inner}</a>
                  </li>
                )
              }
              return <li key={ev.key}><span>{inner}</span></li>
            })}
          </ul>
        </div>
      )}
      {todayEvents && todayEvents.length === 0 && (
        <div className={styles.today}>
          <h4 className={styles.todayLabel}>{todayEventsTitle}</h4>
          <p className={styles.empty}>なし</p>
        </div>
      )}
    </aside>
  )
}

export default MiniCalendarGrid
