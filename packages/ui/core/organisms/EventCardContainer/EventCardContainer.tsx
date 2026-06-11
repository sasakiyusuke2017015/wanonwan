'use client'

import { useCallback, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { useAtomValue, useSetAtom } from 'jotai'
import { CalendarEventCard as EventCardBase } from '../../organisms/CalendarEventCard/CalendarEventCard'
import { useDragEvent } from '../../hooks/calendar/useDragEvent'
import { dragAtom, hoveredEventAtom, eventModalAtom, anyDragActiveAtom, eventsAtom } from '../../hooks/calendar/calendar'
import type { CalendarEvent } from '../../types/calendar'
import { resolveOriginalEvent } from '../../utils/calendar/repeatUtils'

interface EventCardProps {
  readonly event: CalendarEvent
  readonly dayStart: Date
  readonly slotHeight: number
  readonly column?: number
  readonly columnSpan?: number
  readonly totalColumns?: number
  readonly columnWidth?: number
  readonly onDelete: (id: string) => void
  readonly onUpdate: (event: CalendarEvent) => void
  /**
   * イベントクリック時のコールバック。
   * `true` または truthy を返すとデフォルトの挙動（編集モーダルを開く）を抑制する。
   */
  readonly onEventClick?: (event: CalendarEvent, clickedDate: Date) => boolean | void
}

export function EventCardContainer({
  event,
  dayStart,
  slotHeight,
  column = 0,
  columnSpan = 1,
  totalColumns = 1,
  columnWidth,
  onDelete,
  onUpdate,
  onEventClick,
}: EventCardProps) {
  const drag = useAtomValue(dragAtom)
  const hovered = useAtomValue(hoveredEventAtom)
  const isDragging = drag?.eventId === event.id
  const isResizing = isDragging && drag?.mode !== 'move'
  const isHovered = hovered?.event.id === event.id
  const allEvents = useAtomValue(eventsAtom)
  const setHovered = useSetAtom(hoveredEventAtom)
  const setModal = useSetAtom(eventModalAtom)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = useCallback(() => {
    setHovered(null)
    const original = resolveOriginalEvent(event, allEvents)
    if (onEventClick && onEventClick(original, dayStart)) return
    setModal({
      isOpen: true,
      date: dayStart,
      hour: original.startTime.getHours(),
      editingEvent: original,
    })
  }, [event, allEvents, dayStart, setHovered, setModal, onEventClick])

  const { handleMoveStart, handleResizeTopStart, handleResizeBottomStart } =
    useDragEvent({
      event,
      slotHeight,
      columnWidth,
      allEvents,
      onCommit: onUpdate,
      onClick: handleClick,
    })

  const anyDrag = useAtomValue(anyDragActiveAtom)

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (drag || anyDrag) return
    const el = e.currentTarget as HTMLElement
    hoverTimerRef.current = setTimeout(() => {
      const rect = el.getBoundingClientRect()
      setHovered({
        event,
        rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width },
      })
    }, 300)
  }, [event, drag, anyDrag, setHovered])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setHovered(null)
  }, [setHovered])

  // Close popover on scroll
  useEffect(() => {
    if (!isHovered) return
    const close = () => setHovered(null)
    window.addEventListener('scroll', close, { capture: true })
    return () => window.removeEventListener('scroll', close, { capture: true })
  }, [isHovered, setHovered])

  const startLabel = format(event.startTime, 'HH:mm')
  const endLabel = format(event.endTime, 'HH:mm')

  const dayStartMs = dayStart.getTime()

  // イベントがこの日に開始するかどうか
  const eventStartDay = new Date(event.startTime)
  eventStartDay.setHours(0, 0, 0, 0)
  const startsOnThisDay = eventStartDay.getTime() === dayStartMs

  // この日に開始するイベントのみ、日またぎでも全体を表示
  // 開始が前日の場合は表示しない（前日のカードが伸びてくる）
  const clampedStart = Math.max(event.startTime.getTime(), dayStartMs)

  // 日またぎイベントの場合、終了時刻をクランプしない（次の日にはみ出す）
  const endHoursFromDayStart = (event.endTime.getTime() - dayStartMs) / (1000 * 60 * 60)

  const startHours = (clampedStart - dayStartMs) / (1000 * 60 * 60)
  const durationHours = endHoursFromDayStart - startHours

  const top = startHours * slotHeight
  const height = Math.max(durationHours * slotHeight, slotHeight / 2)

  // 前日から始まるイベントは表示しない（前日のカードが伸びてくるため）
  if (!startsOnThisDay) {
    return null
  }

  const leftPercent = (column / totalColumns) * 100
  const widthPercent = (columnSpan / totalColumns) * 100

  return (
    <EventCardBase
      title={event.title}
      icon={event.icon}
      startLabel={startLabel}
      endLabel={endLabel}
      top={top}
      height={height}
      color={event.color}
      leftPercent={leftPercent}
      widthPercent={widthPercent}
      zColumn={isDragging ? 999 : column}
      onDelete={() => onDelete(event.id)}
      onPointerDown={handleMoveStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      isDragging={isDragging && !isResizing}
      isHovered={isHovered}
    >
      {/* Resize handle: top */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 cursor-n-resize"
        onPointerDown={handleResizeTopStart}
      />
      {/* Resize handle: bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5 cursor-s-resize"
        onPointerDown={handleResizeBottomStart}
      />
    </EventCardBase>
  )
}
