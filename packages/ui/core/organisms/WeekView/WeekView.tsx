'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { selectedDateAtom, eventModalAtom, hoveredEventAtom, anyDragActiveAtom } from '../../hooks/calendar/calendar'
import { getWeekDates, formatHour, isToday, coversFullDay, getEventsForDay } from '../../utils/calendar/dates'
import { DayColumn } from '../DayColumn/DayColumn'
import { CalendarEventCard as EventCardBase } from '../../organisms/CalendarEventCard/CalendarEventCard'
import { CalendarDragOverlay } from '../CalendarDragOverlay/CalendarDragOverlay'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useCallback, useRef, useState, useEffect } from 'react'
import type { CalendarEvent } from '../../types/calendar'
import wvStyles from './WeekView.module.scss'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SLOT_HEIGHT = 48



interface CalendarStorageProps {
  readonly events: readonly CalendarEvent[]
  readonly showAllDayBar?: boolean
  readonly persistEvent: (event: CalendarEvent) => Promise<void>
  readonly removeEvent: (id: string) => Promise<void>
  /**
   * イベントクリック時のコールバック。
   * `true` または truthy を返すとデフォルトの挙動（編集モーダルを開く）を抑制する。
   * 未指定の場合は従来通り編集モーダルを表示する。
   */
  readonly onEventClick?: (event: CalendarEvent, clickedDate: Date) => boolean | void
}

export function WeekView({ events, showAllDayBar = true, persistEvent, removeEvent, onEventClick }: CalendarStorageProps) {
  const [selectedDate] = useAtom(selectedDateAtom)
  const setModal = useSetAtom(eventModalAtom)
  const hovered = useAtomValue(hoveredEventAtom)
  const setHovered = useSetAtom(hoveredEventAtom)
  const anyDrag = useAtomValue(anyDragActiveAtom)
  const weekDates = getWeekDates(selectedDate)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dayColRef = useRef<HTMLDivElement>(null)
  const [colWidth, setColWidth] = useState(0)

  useEffect(() => {
    if (!dayColRef.current) return
    const measure = () => setColWidth(dayColRef.current?.offsetWidth ?? 0)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(dayColRef.current)
    return () => ro.disconnect()
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await removeEvent(id)
      } catch (error) {
        throw new Error(`Failed to delete event: ${error}`)
      }
    },
    [removeEvent]
  )

  const handleUpdate = useCallback(
    async (event: CalendarEvent) => {
      try {
        await persistEvent(event)
      } catch (error) {
        throw new Error(`Failed to update event: ${error}`)
      }
    },
    [persistEvent]
  )

  return (
    <div data-component="WeekView" className="h-full overflow-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div style={{ minWidth: '640px' }}>
      {/* Header */}
      <div data-sticky-header className="sticky top-0 bg-surface border-b border-border" style={{ zIndex: 40 }}>
        <div className="grid grid-cols-[64px_repeat(7,1fr)]">
          <div className="border-r border-border" />
          {weekDates.map((date) => {
            const today = isToday(date)
            const dow = date.getDay()
            const weekendClass = today ? wvStyles.todayHeader
              : dow === 0 ? wvStyles.sundayHeader
              : dow === 6 ? wvStyles.saturdayHeader
              : dow % 2 === 0 ? wvStyles.weekdayEvenHeader
              : ''
            return (
              <div
                key={date.toISOString()}
                className={`text-center py-2 border-r border-border ${weekendClass}`}
              >
                <div className={`text-xs ${dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-text-secondary'}`}>
                  {format(date, 'E', { locale: ja })}
                </div>
                <div
                  className={`text-lg font-bold ${
                    today ? 'text-primary'
                      : dow === 0 ? 'text-red-500'
                      : dow === 6 ? 'text-blue-500'
                      : 'text-text'
                  }`}
                >
                  {format(date, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* All-day events row */}
        {showAllDayBar && weekDates.some((d) => getEventsForDay(events, d).some((e) => coversFullDay(e, d))) && (
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border bg-surface">
            <div className="text-[10px] text-text-secondary py-1 pr-2 text-right border-r border-border/50 select-none flex items-center justify-end">
              終日
            </div>
            {weekDates.map((date) => {
              const allDayEvents = getEventsForDay(events, date).filter((e) => coversFullDay(e, date))
              return (
                <div key={date.toISOString()} className="flex gap-0.5 p-0.5 border-r border-border/50 h-[28px] overflow-hidden">
                  {allDayEvents.map((event) => (
                    <EventCardBase
                      key={event.id}
                      variant="compact"
                      title={event.title}
                      color={event.color}
                      isHovered={hovered?.event.id === event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onEventClick && onEventClick(event, date)) return
                        setModal({
                          isOpen: true,
                          date,
                          hour: event.startTime.getHours(),
                          editingEvent: event,
                        })
                      }}
                      onMouseEnter={(e) => {
                        if (anyDrag) return
                        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
                        hoverTimerRef.current = setTimeout(() => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect()
                          setHovered({
                            event,
                            rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width },
                          })
                        }, 300)
                      }}
                      onMouseLeave={() => {
                        if (hoverTimerRef.current) {
                          clearTimeout(hoverTimerRef.current)
                          hoverTimerRef.current = null
                        }
                        setHovered(null)
                      }}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)]">
        {/* Time labels */}
        <div>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="text-xs text-text-secondary py-1 pr-2 text-right border-r border-b border-border/50 select-none"
              style={{ height: `${SLOT_HEIGHT}px` }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Day columns — same DayColumn as day view */}
        {weekDates.map((date, i) => {
          const dow = date.getDay()
          const colClass = dow === 0 ? wvStyles.sundayCol : dow === 6 ? wvStyles.saturdayCol : dow % 2 === 0 ? wvStyles.weekdayEvenCol : ''
          return (
          <div key={date.toISOString()} ref={i === 0 ? dayColRef : undefined} className={`border-r border-border ${colClass}`} data-date={date.toISOString()}>
            <DayColumn
              date={date}
              events={showAllDayBar ? getEventsForDay(events, date).filter((e) => !coversFullDay(e, date)) : getEventsForDay(events, date)}
              slotHeight={SLOT_HEIGHT}
              columnWidth={colWidth}
              onDeleteEvent={handleDelete}
              onUpdateEvent={handleUpdate}
              onEventClick={onEventClick}
            />
          </div>
          )
        })}
      </div>
      <CalendarDragOverlay />
      </div>
    </div>
  )
}
