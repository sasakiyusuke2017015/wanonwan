'use client'

import { useMemo } from 'react'
import { Badge } from '../../atoms/Badge'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  format,
  isToday,
  isPast,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { selectedDateAtom, editingEventAtom } from '../../hooks/calendar/calendar'
import { getEventsForDay } from '../../utils/calendar/dates'
import type { CalendarEvent } from '../../types/calendar'
import { Icon } from '../../atoms/Icon/Icon'
import styles from './AgendaView.module.scss'

export interface AgendaViewProps {
  readonly events: readonly CalendarEvent[]
  readonly persistEvent: (event: CalendarEvent) => Promise<void>
  readonly removeEvent: (id: string) => Promise<void>
  /**
   * イベントクリック時のコールバック。
   * `true` または truthy を返すとデフォルトの挙動（編集モーダルを開く）を抑制する。
   */
  readonly onEventClick?: (event: CalendarEvent, clickedDate: Date) => boolean | void
}

interface DayGroup {
  readonly date: Date
  readonly events: readonly CalendarEvent[]
  readonly isToday: boolean
  readonly isPast: boolean
}

/**
 * AgendaView - 予定リスト表示
 *
 * 日付ごとにグループ化されたイベントをリスト形式で表示
 * - タイムライン風レイアウト
 * - 今日以降の予定を強調
 * - 空の日は非表示
 */
export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  const currentDate = useAtomValue(selectedDateAtom)
  const setEditingEvent = useSetAtom(editingEventAtom)

  // 表示期間内の予定をグループ化
  const dayGroups = useMemo((): DayGroup[] => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return days
      .map((date) => {
        const dayEvents = getEventsForDay(events, date)
        return {
          date,
          events: dayEvents,
          isToday: isToday(date),
          isPast: isPast(startOfDay(date)) && !isToday(date),
        }
      })
      .filter((group) => group.events.length > 0) // 予定がある日のみ
  }, [currentDate, events])

  const handleEventClick = (event: CalendarEvent, clickedDate: Date) => {
    if (onEventClick && onEventClick(event, clickedDate)) return
    setEditingEvent(event)
  }

  if (dayGroups.length === 0) {
    return (
      <div className={styles.agendaView__empty}>
        <Icon name="calendar" size="xxl" color="muted" />
        <p className={styles.agendaView__emptyText}>この期間に予定はありません</p>
      </div>
    )
  }

  return (
    <div className={styles.agendaView} data-component="AgendaView">
      <div className={styles.agendaView__list}>
        {dayGroups.map((group) => (
          <div
            key={group.date.toISOString()}
            className={styles.agendaView__dayGroup}
            data-is-today={group.isToday}
            data-is-past={group.isPast}
          >
            {/* 日付ヘッダー */}
            <div className={styles.agendaView__dateHeader}>
              <div className={styles.agendaView__dateLabel}>
                <span className={styles.agendaView__dateDay}>
                  {format(group.date, 'd', { locale: ja })}
                </span>
                <span className={styles.agendaView__dateWeekday}>
                  {format(group.date, 'E', { locale: ja })}
                </span>
              </div>
              {group.isToday && (
                <Badge variant="info" size="small">今日</Badge>
              )}
            </div>

            {/* イベントリスト */}
            <div className={styles.agendaView__events}>
              {group.events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={styles.agendaView__eventCard}
                  onClick={() => handleEventClick(event, group.date)}
                  style={{ '--event-color': event.color } as React.CSSProperties}
                >
                  <div className={styles.agendaView__eventTime}>
                    {event.allDay ? (
                      <span className={styles.agendaView__eventAllDay}>終日</span>
                    ) : (
                      <>
                        <span>{format(event.startTime, 'HH:mm', { locale: ja })}</span>
                        <span className={styles.agendaView__eventTimeSeparator}>-</span>
                        <span>{format(event.endTime, 'HH:mm', { locale: ja })}</span>
                      </>
                    )}
                  </div>
                  <div className={styles.agendaView__eventContent}>
                    <div className={styles.agendaView__eventTitle}>
                      {event.icon && (
                        <Icon name={event.icon as any} size="sm" className={styles.agendaView__eventIcon} />
                      )}
                      <span>{event.title}</span>
                    </div>
                    {event.description && (
                      <p className={styles.agendaView__eventDescription}>{event.description}</p>
                    )}
                    {event.repeat && event.repeat.length > 0 && (
                      <div className={styles.agendaView__eventRepeat}>
                        <Icon name="arrow-rotate" size="xs" />
                        <span>繰り返し</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
