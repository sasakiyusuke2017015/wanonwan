'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { selectedDateAtom, activeSlotAtom, eventModalAtom, hoveredEventAtom, anyDragActiveAtom } from '../../hooks/calendar/calendar'
import {
  getMonthCalendarDates,
  getEventsForDay,
} from '../../utils/calendar/dates'
import { format, startOfDay, differenceInCalendarDays } from 'date-fns'
import { SpanningBar } from '../../molecules/SpanningBar/SpanningBar'
import { MonthDragOverlay } from '../MonthDragOverlay/MonthDragOverlay'
import { MonthDayCell } from '../../organisms/MonthDayCell/MonthDayCell'
import { layoutSpanningEvents } from '../../utils/calendar/layoutSpanning'
import { ja } from 'date-fns/locale'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { CalendarEvent } from '../../types/calendar'
import { resolveOriginalEvent } from '../../utils/calendar/repeatUtils'
import styles from './MonthView.module.scss'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']
const IS_TOUCH = typeof window !== 'undefined' && 'ontouchstart' in window
const LANE_H = IS_TOUCH ? 28 : 20
const DRAG_THRESHOLD = 5

/* ------------------------------------------------------------------ */

function findDateCellFromPoint(x: number, y: number): string | null {
  const els = document.elementsFromPoint(x, y)
  for (const el of els) {
    const dateAttr = (el as HTMLElement).dataset?.monthDate
    if (dateAttr) return dateAttr
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  Drag state                                                        */
/* ------------------------------------------------------------------ */

type MonthDragMode = 'move' | 'resize-left' | 'resize-right'

interface MonthDragState {
  readonly event: CalendarEvent
  readonly originDate: Date
  readonly mode: MonthDragMode
  readonly startX: number
  readonly startY: number
  readonly started: boolean
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface CalendarStorageProps {
  readonly events: readonly CalendarEvent[]
  readonly persistEvent: (event: CalendarEvent) => Promise<void>
  readonly removeEvent: (id: string) => Promise<void>
  /**
   * イベントクリック時のコールバック。
   * `true` または truthy を返すとデフォルトの挙動（編集モーダルを開く）を抑制する。
   * 未指定の場合は従来通り編集モーダルを表示する。
   */
  readonly onEventClick?: (event: CalendarEvent, clickedDate: Date) => boolean | void
}

export function MonthView({ events, persistEvent, removeEvent, onEventClick }: CalendarStorageProps) {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom)
  const [hovered, setHovered] = useAtom(hoveredEventAtom)
  const setAnyDrag = useSetAtom(anyDragActiveAtom)
  const anyDrag = useAtomValue(anyDragActiveAtom)
  const activeSlot = useAtomValue(activeSlotAtom)
  const setActiveSlot = useSetAtom(activeSlotAtom)
  const setModal = useSetAtom(eventModalAtom)
  const calendarDates = useMemo(
    () => getMonthCalendarDates(selectedDate),
    [selectedDate]
  )

  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < calendarDates.length; i += 7) {
      result.push(calendarDates.slice(i, i + 7) as Date[])
    }
    return result
  }, [calendarDates])

  // Drag state
  const [dragEventId, setDragEventId] = useState<string | null>(null)
  const [dropDateStr, setDropDateStr] = useState<string | null>(null)
  const [dragInitialPointer, setDragInitialPointer] = useState<{ x: number; y: number } | null>(null)
  const dragRef = useRef<MonthDragState | null>(null)

  // Compute dragEvent from dragEventId and events (no separate state needed)
  const dragEvent = dragEventId ? events.find(e => e.id === dragEventId) ?? null : null

  const dropDateRef = useRef<string | null>(null)

  const handlePointerMoveReal = useCallback((e: PointerEvent) => {
    const state = dragRef.current
    if (!state) return

    if (!state.started) {
      const dx = Math.abs(e.clientX - state.startX)
      const dy = Math.abs(e.clientY - state.startY)
      const threshold = state.mode === 'move' ? DRAG_THRESHOLD : 3
      if (dx < threshold && dy < threshold) return
      ;(dragRef.current as { started: boolean }).started = true
      setDragEventId(state.event.id)
      setDragInitialPointer({ x: e.clientX, y: e.clientY })
      setHovered(null)
      setAnyDrag(true)
      document.body.style.cursor = state.mode === 'move' ? 'grabbing' : 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    const dateStr = findDateCellFromPoint(e.clientX, e.clientY)
    dropDateRef.current = dateStr
    setDropDateStr(dateStr)
  }, [])

  // Store listener refs so all handlers can remove each other
  const listenersRef = useRef<{
    move: (e: PointerEvent) => void
    up: () => void
    key: (e: KeyboardEvent) => void
  } | null>(null)

  const cleanupDrag = useCallback(() => {
    const listeners = listenersRef.current
    const wasStarted = dragRef.current?.started ?? false
    if (listeners) {
      document.removeEventListener('pointermove', listeners.move)
      document.removeEventListener('pointerup', listeners.up)
      document.removeEventListener('keydown', listeners.key)
      listenersRef.current = null
    }
    dragRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    dropDateRef.current = null
    setDragEventId(null)
    setDropDateStr(null)
    setDragInitialPointer(null)
    setAnyDrag(false)

    // ドラッグ直後のクリック誤発火を防止
    if (wasStarted) {
      recentDragRef.current = true
      requestAnimationFrame(() => { recentDragRef.current = false })
    }
  }, [setAnyDrag])

  const handlePointerUpReal = useCallback(() => {
    const state = dragRef.current
    const targetStr = dropDateRef.current
    cleanupDrag()

    if (!state?.started || !targetStr) return

    const targetDate = new Date(targetStr)
    const dayDelta = differenceInCalendarDays(targetDate, state.originDate)
    if (dayDelta === 0) return

    const DAY_MS = 24 * 60 * 60 * 1000

    if (state.mode === 'move') {
      const deltaMs = dayDelta * DAY_MS
      if (state.event.repeat) {
        // 繰り返しイベント: 元イベントの期間をシフト、時刻維持
        const original = resolveOriginalEvent(state.event, events)
        const newStart = new Date(original.startTime)
        newStart.setDate(newStart.getDate() + dayDelta)
        const newEnd = new Date(original.endTime)
        newEnd.setDate(newEnd.getDate() + dayDelta)
        persistEvent({ ...original, startTime: newStart, endTime: newEnd })
      } else {
        persistEvent({
          ...state.event,
          startTime: new Date(state.event.startTime.getTime() + deltaMs),
          endTime: new Date(state.event.endTime.getTime() + deltaMs),
        })
      }
    } else if (state.mode === 'resize-left') {
      const newStart = new Date(state.event.startTime.getTime() + dayDelta * DAY_MS)
      if (newStart < state.event.endTime) {
        persistEvent({ ...state.event, startTime: newStart })
      }
    } else {
      const newEnd = new Date(state.event.endTime.getTime() + dayDelta * DAY_MS)
      if (newEnd > state.event.startTime) {
        persistEvent({ ...state.event, endTime: newEnd })
      }
    }
  }, [cleanupDrag, persistEvent, events])

  const handleEscapeCancel = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    cleanupDrag()
  }, [cleanupDrag])

  const startEventDrag = useCallback(
    (event: CalendarEvent, originDate: Date, e: React.PointerEvent, mode: MonthDragMode = 'move') => {
      if (e.button !== 0) return
      e.stopPropagation()
      e.preventDefault()
      dragRef.current = {
        event,
        originDate: startOfDay(originDate),
        mode,
        startX: e.clientX,
        startY: e.clientY,
        started: false,
      }

      const listeners = {
        move: handlePointerMoveReal,
        up: handlePointerUpReal,
        key: handleEscapeCancel,
      }
      listenersRef.current = listeners

      document.addEventListener('pointermove', listeners.move)
      document.addEventListener('pointerup', listeners.up)
      document.addEventListener('keydown', listeners.key)
    },
    [handlePointerMoveReal, handlePointerUpReal, handleEscapeCancel]
  )

  const handleEventClick = useCallback(
    (event: CalendarEvent, clickedDate: Date, e: React.MouseEvent) => {
      e.stopPropagation()
      // 繰り返しイベントは仮想インスタンスではなく元イベントで編集
      const original = resolveOriginalEvent(event, events)
      if (onEventClick && onEventClick(original, clickedDate)) return
      setModal({
        isOpen: true,
        date: clickedDate,
        hour: original.startTime.getHours(),
        editingEvent: original,
      })
    },
    [setModal, events, onEventClick]
  )

  // ドラッグ直後のクリック誤発火を防止
  const recentDragRef = useRef(false)

  const handleDayClick = useCallback(
    (date: Date) => {
      if (dragRef.current || slotDragStarted.current || recentDragRef.current) return
      setSelectedDate(date)
      setActiveSlot({ date: date.toDateString(), hour: 9 })
      setModal({ isOpen: true, date, hour: 9 })
    },
    [setModal, setSelectedDate, setActiveSlot]
  )

  // Slot drag to create event across multiple days
  const [slotDrag, setSlotDrag] = useState<{ startDate: Date; currentDate: Date } | null>(null)
  const slotDragRef = useRef<{ startDate: Date; currentDate: Date } | null>(null)
  const slotDragStarted = useRef(false)
  const slotListenersRef = useRef<{ move: (e: PointerEvent) => void; up: () => void } | null>(null)

  const handleSlotPointerMove = useCallback((e: PointerEvent) => {
    const dateStr = findDateCellFromPoint(e.clientX, e.clientY)
    if (!dateStr) return
    const date = new Date(dateStr)
    const prev = slotDragRef.current
    if (!prev || prev.currentDate.getTime() === date.getTime()) return
    slotDragStarted.current = true
    const next = { ...prev, currentDate: date }
    slotDragRef.current = next
    setSlotDrag(next)
  }, [])

  const handleSlotPointerUp = useCallback(() => {
    const listeners = slotListenersRef.current
    if (listeners) {
      document.removeEventListener('pointermove', listeners.move)
      document.removeEventListener('pointerup', listeners.up)
      slotListenersRef.current = null
    }

    const drag = slotDragRef.current
    if (drag && slotDragStarted.current) {
      const start = drag.startDate < drag.currentDate ? drag.startDate : drag.currentDate
      const end = drag.startDate < drag.currentDate ? drag.currentDate : drag.startDate
      setActiveSlot({ date: start.toDateString(), hour: 9, endDate: end.toDateString() })
      setModal({ isOpen: true, date: start, hour: 9, endDate: end })
    }
    slotDragRef.current = null
    setSlotDrag(null)
    slotDragStarted.current = false
  }, [setModal, setActiveSlot])

  const handleDayPointerDown = useCallback((date: Date, e: React.PointerEvent) => {
    if (e.button !== 0 || dragRef.current) return
    slotDragStarted.current = false
    const initial = { startDate: date, currentDate: date }
    slotDragRef.current = initial
    setSlotDrag(initial)

    const listeners = {
      move: handleSlotPointerMove,
      up: handleSlotPointerUp,
    }
    slotListenersRef.current = listeners
    document.addEventListener('pointermove', listeners.move)
    document.addEventListener('pointerup', listeners.up)
  }, [handleSlotPointerMove, handleSlotPointerUp])

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEventMouseEnter = useCallback(
    (event: CalendarEvent, e: React.MouseEvent) => {
      if (dragEventId || anyDrag) return
      const el = e.currentTarget as HTMLElement
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = setTimeout(() => {
        const rect = el.getBoundingClientRect()
        setHovered({
          event,
          rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width },
        })
      }, 300)
    },
    [dragEventId, anyDrag, setHovered]
  )

  const handleEventMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setHovered(null)
  }, [setHovered])

  const hoveredEventId = hovered?.event.id ?? null

  // removeEvent is available for future use (e.g., context menu delete)
  void removeEvent

  return (
    <div data-component="MonthView" className="h-full flex flex-col p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-text">
          {format(selectedDate, 'yyyy年M月', { locale: ja })}
        </h2>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-sm font-medium py-2 ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-text-secondary'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {weeks.map((week, weekIdx) => {
          const { spanning, laneCount } = layoutSpanningEvents(events, week)
          const spanningIds = new Set(spanning.map((s) => s.event.id))
          const laneAreaH = laneCount * LANE_H

          return (
            <div key={weekIdx} className={`grid grid-cols-7 border-b border-border/50 relative ${weekIdx % 2 === 0 ? styles.weekRowEven : ''}`}>
              {/* Spanning event bars */}
              {spanning.map(({ event, startCol, endCol, lane, continuesLeft, continuesRight }) => (
                <SpanningBar
                  key={event.id}
                  event={event}
                  startCol={startCol}
                  endCol={endCol}
                  lane={lane}
                  continuesLeft={continuesLeft}
                  continuesRight={continuesRight}
                  isDragging={dragEventId === event.id}
                  isDragActive={dragEventId !== null}
                  isHovered={hoveredEventId === event.id}
                  onClick={handleEventClick}
                  onDragStart={startEventDrag}
                  onMouseEnter={handleEventMouseEnter}
                  onMouseLeave={handleEventMouseLeave}
                  weekDates={week}
                />
              ))}

              {/* Day cells */}
              {week.map((date) => (
                <MonthDayCell
                  key={date.toISOString()}
                  date={date}
                  selectedDate={selectedDate}
                  events={getEventsForDay(events, date)}
                  spanningIds={spanningIds}
                  laneAreaH={laneAreaH}
                  isActive={(() => {
                    if (!activeSlot) return false
                    if (!activeSlot.endDate) return activeSlot.date === date.toDateString()
                    const d = startOfDay(date).getTime()
                    return d >= new Date(activeSlot.date).getTime() && d <= new Date(activeSlot.endDate).getTime()
                  })()}
                  isDropTarget={(() => {
                    if (!dragEventId || !dropDateStr || !dragEvent) return false
                    const dropDate = new Date(dropDateStr)
                    const originDate = dragRef.current?.originDate
                    if (!originDate) return dropDateStr === date.toISOString()

                    if (dragEvent.repeat) {
                      // 繰り返しイベント: 曜日マッチ かつ シフト後の期間内
                      if (!dragEvent.repeat.includes(date.getDay() as 0|1|2|3|4|5|6)) return false
                      const dayDelta = differenceInCalendarDays(dropDate, originDate)
                      const shiftedStart = startOfDay(new Date(dragEvent.startTime.getTime() + dayDelta * 86400000))
                      const shiftedEnd = new Date(dragEvent.endTime.getTime() + dayDelta * 86400000)
                      shiftedEnd.setHours(23, 59, 59, 999)
                      const cellDate = startOfDay(date)
                      return cellDate >= shiftedStart && cellDate <= shiftedEnd
                    }

                    const dayDelta = differenceInCalendarDays(dropDate, originDate)
                    const newStart = new Date(dragEvent.startTime.getTime() + dayDelta * 86400000)
                    const newEnd = new Date(dragEvent.endTime.getTime() + dayDelta * 86400000)
                    const cellStart = new Date(date)
                    cellStart.setHours(0, 0, 0, 0)
                    const cellEnd = new Date(date)
                    cellEnd.setHours(23, 59, 59, 999)
                    return cellStart <= newEnd && cellEnd >= newStart
                  })()}
                  dragEventId={dragEventId}
                  todayCellClass={styles.todayCell ?? ''}
                  dropTargetClass={styles.dropTarget ?? ''}
                  dropTargetColor={dragEvent?.color}
                  isSlotSelected={(() => {
                    if (!slotDrag) return false
                    const start = slotDrag.startDate < slotDrag.currentDate ? slotDrag.startDate : slotDrag.currentDate
                    const end = slotDrag.startDate < slotDrag.currentDate ? slotDrag.currentDate : slotDrag.startDate
                    const d = startOfDay(date)
                    return d >= startOfDay(start) && d <= startOfDay(end)
                  })()}
                  hoveredEventId={hoveredEventId}
                  onDayClick={handleDayClick}
                  onDayPointerDown={handleDayPointerDown}
                  onEventClick={handleEventClick}
                  onEventDragStart={startEventDrag}
                  onEventMouseEnter={handleEventMouseEnter}
                  onEventMouseLeave={handleEventMouseLeave}
                />
              ))}
            </div>
          )
        })}
      </div>

      <MonthDragOverlay event={dragEvent} initialPointer={dragInitialPointer} />
    </div>
  )
}
