'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { isToday, isSameMonth } from '../../utils/calendar/dates'
import { MonthEventCard } from '../../molecules/MonthEventCard/MonthEventCard'
import type { CalendarEvent } from '../../types/calendar'
import styles from './MonthDayCell.module.scss'

interface MonthDayCellProps {
  readonly date: Date
  readonly selectedDate: Date
  readonly events: readonly CalendarEvent[]
  readonly spanningIds: ReadonlySet<string>
  readonly laneAreaH: number
  readonly isActive: boolean
  readonly isDropTarget: boolean
  readonly dragEventId: string | null
  readonly todayCellClass: string
  readonly dropTargetClass: string
  readonly dropTargetColor?: string
  readonly isSlotSelected?: boolean
  readonly hoveredEventId: string | null
  readonly onDayClick: (date: Date) => void
  readonly onDayPointerDown?: (date: Date, e: React.PointerEvent) => void
  readonly onEventClick: (event: CalendarEvent, date: Date, e: React.MouseEvent) => void
  readonly onEventDragStart: (event: CalendarEvent, date: Date, e: React.PointerEvent) => void
  readonly onEventMouseEnter: (event: CalendarEvent, e: React.MouseEvent) => void
  readonly onEventMouseLeave: () => void
}

export function MonthDayCell({
  date,
  selectedDate,
  events,
  spanningIds,
  laneAreaH,
  isActive,
  isDropTarget,
  dragEventId,
  todayCellClass,
  dropTargetClass,
  dropTargetColor,
  isSlotSelected = false,
  hoveredEventId,
  onDayClick,
  onDayPointerDown,
  onEventClick,
  onEventDragStart,
  onEventMouseEnter,
  onEventMouseLeave,
}: MonthDayCellProps) {
  const today = isToday(date)
  const inMonth = isSameMonth(date, selectedDate)
  const dayOfWeek = date.getDay()
  const [expanded, setExpanded] = useState(false)

  const MAX_VISIBLE = 3
  const timedEvents = events.filter((e) => !spanningIds.has(e.id)).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  const visibleEvents = timedEvents.slice(0, MAX_VISIBLE)
  const hiddenCount = timedEvents.length - MAX_VISIBLE
  const hasMore = hiddenCount > 0

  const dateLabelClass = [
    styles.dateLabel,
    today ? styles.today : dayOfWeek === 0 ? styles.sunday : dayOfWeek === 6 ? styles.saturday : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      data-component="MonthDayCell"
      data-month-date={date.toISOString()}
      onClick={() => onDayClick(date)}
      onPointerDown={(e) => onDayPointerDown?.(date, e)}
      className={[
        styles.cell,
        !inMonth ? styles.outOfMonth : '',
        today ? todayCellClass : '',
        isDropTarget ? dropTargetClass : '',
      ].filter(Boolean).join(' ')}
      style={isDropTarget && dropTargetColor ? {
        backgroundColor: `${dropTargetColor}10`,
        boxShadow: `inset 0 0 0 2px ${dropTargetColor}4D`,
      } : undefined}
    >
      {isActive && !isSlotSelected && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-20" />
      )}
      {isSlotSelected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none z-20" style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', border: '2px solid rgba(79, 70, 229, 0.4)' }} />
      )}

      <div className={dateLabelClass}>
        {format(date, 'd')}
      </div>

      {laneAreaH > 0 && <div style={{ height: `${laneAreaH}px` }} />}

      {timedEvents.length > 0 && (
        <div className={styles.events}>
          {(expanded ? timedEvents : visibleEvents).map((event) => (
            <MonthEventCard
              key={event.id}
              event={event}
              isDragging={dragEventId === event.id}
              isHovered={hoveredEventId === event.id}
              onClick={(e) => onEventClick(event, date, e)}
              onPointerDown={(e) => onEventDragStart(event, date, e)}
              onMouseEnter={(e) => onEventMouseEnter(event, e)}
              onMouseLeave={onEventMouseLeave}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div
          className={styles.timedToggle}
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((prev) => !prev)
          }}
        >
          {expanded ? '予定を非表示' : `他${hiddenCount}件の予定`}
        </div>
      )}
    </div>
  )
}
