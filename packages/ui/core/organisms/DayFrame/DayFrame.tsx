'use client'

import { useAtomValue } from 'jotai'
import { formatDayHeader, isToday, getEventsForDay } from '../../utils/calendar/dates'
import { DayColumn } from '../DayColumn/DayColumn'
import { anyDragActiveAtom } from '../../hooks/calendar/calendar'
import type { CalendarEvent } from '../../types/calendar'
import styles from './DayFrame.module.scss'

const SLOT_HEIGHT = 56
const LABEL_WIDTH = 64

type HeaderVariant = 'blur' | 'subtle'

interface DayFrameProps {
  readonly date: Date
  readonly events: readonly CalendarEvent[]
  readonly headerVariant?: HeaderVariant
  readonly onDeleteEvent: (id: string) => void
  readonly onUpdateEvent: (event: CalendarEvent) => void
  /**
   * イベントクリック時のコールバック。
   * `true` または truthy を返すとデフォルトの挙動（編集モーダルを開く）を抑制する。
   */
  readonly onEventClick?: (event: CalendarEvent, clickedDate: Date) => boolean | void
}

const HEADER_VARIANT_CLASS: Record<HeaderVariant, string> = {
  blur: styles.blur,
  subtle: styles.subtle,
}

export function DayFrame({ date, events, headerVariant = 'blur', onDeleteEvent, onUpdateEvent, onEventClick }: DayFrameProps) {
  const today = isToday(date)
  const dayEvents = getEventsForDay(events, date)
  const dow = date.getDay()
  const anyDrag = useAtomValue(anyDragActiveAtom)

  const dayClass = today
    ? styles.todayHeader
    : dow === 0
      ? styles.sundayHeader
      : dow === 6
        ? styles.saturdayHeader
        : ''

  const variantClass = HEADER_VARIANT_CLASS[headerVariant]
  const headerClass = `${variantClass} ${dayClass}`

  const textClass = today
    ? 'text-primary'
    : dow === 0
      ? 'text-red-500'
      : dow === 6
        ? 'text-blue-500'
        : 'text-text'

  return (
    <div
      data-component="DayFrame"
      className="min-h-screen"
      data-date={date.toISOString()}
      style={{ overflow: 'visible' }}
    >
      <div
        data-sticky-header
        className={`${styles.header} ${headerClass}`}
        style={anyDrag ? { pointerEvents: 'none' } : undefined}
      >
        <h2 className={`text-lg font-bold ${textClass}`}>
          {formatDayHeader(date)}
          {today && (
            <span className="ml-2 text-xs font-normal bg-primary text-white px-2 py-0.5 rounded-full">
              TODAY
            </span>
          )}
        </h2>
      </div>

      <div className="px-2" style={{ overflow: 'visible' }}>
        <DayColumn
          date={date}
          events={dayEvents}
          slotHeight={SLOT_HEIGHT}
          labelWidth={LABEL_WIDTH}
          onDeleteEvent={onDeleteEvent}
          onUpdateEvent={onUpdateEvent}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  )
}
