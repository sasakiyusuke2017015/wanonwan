'use client'

import { useCallback, useMemo, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { activeSlotAtom, eventModalAtom, dragAtom, selectedDateAtom, anyDragActiveAtom, hoveredEventAtom } from '../../hooks/calendar/calendar'
import { formatHour, isToday } from '../../utils/calendar/dates'
import { layoutEvents } from '../../utils/calendar/layoutEvents'
import { EventCardContainer } from '../EventCardContainer/EventCardContainer'
import type { CalendarEvent } from '../../types/calendar'
import dcStyles from './DayColumn.module.scss'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface DayColumnProps {
  readonly date: Date
  readonly events: readonly CalendarEvent[]
  readonly slotHeight: number
  readonly labelWidth?: number
  readonly columnWidth?: number
  readonly onDeleteEvent: (id: string) => void
  readonly onUpdateEvent: (event: CalendarEvent) => void
  /**
   * イベントクリック時のコールバック。
   * `true` または truthy を返すとデフォルトの挙動（編集モーダルを開く）を抑制する。
   */
  readonly onEventClick?: (event: CalendarEvent, clickedDate: Date) => boolean | void
}

export function DayColumn({
  date,
  events,
  slotHeight,
  labelWidth = 0,
  columnWidth,
  onDeleteEvent,
  onUpdateEvent,
  onEventClick,
}: DayColumnProps) {
  const activeSlot = useAtomValue(activeSlotAtom)
  const setActiveSlot = useSetAtom(activeSlotAtom)
  const setModal = useSetAtom(eventModalAtom)
  const setSelectedDate = useSetAtom(selectedDateAtom)
  const drag = useAtomValue(dragAtom)
  const anyDrag = useAtomValue(anyDragActiveAtom)
  const setAnyDrag = useSetAtom(anyDragActiveAtom)
  const setHovered = useSetAtom(hoveredEventAtom)

  const dateKey = date.toDateString()
  const today = isToday(date)

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const layouted = layoutEvents(events as CalendarEvent[])

  // Slot drag to create event
  // isDragging を state に含めることで、ref を使わずにドラッグ状態を追跡
  const [slotDrag, setSlotDrag] = useState<{
    startHour: number
    currentHour: number
    startClientY: number
    isDragging: boolean
  } | null>(null)

  // 相対移動量ベースで時刻を計算（スクロール位置に依存しない）
  const handleDocPointerMove = useCallback(
    (e: PointerEvent) => {
      setSlotDrag((prev) => {
        if (!prev) return prev
        // 相対移動量から時刻を計算
        const deltaY = e.clientY - prev.startClientY
        const hourDelta = Math.floor(deltaY / slotHeight)
        const newHour = prev.startHour + hourDelta
        // -23〜47 の範囲（上方向は前日1時まで、下方向は翌日23時まで許可）
        const clampedHour = Math.max(-23, Math.min(47, newHour))

        if (prev.currentHour === clampedHour && prev.isDragging) return prev
        return { ...prev, currentHour: clampedHour, isDragging: true }
      })
    },
    [slotHeight]
  )

  const handleDocPointerUp = useCallback(
    () => {
      document.removeEventListener('pointermove', handleDocPointerMove)
      document.removeEventListener('pointerup', handleDocPointerUp)

      setSlotDrag((prev) => {
        if (!prev) return null

        if (prev.isDragging) {
          // ドラッグ時: 開始スロットの上端からドラッグ先スロットの上端まで
          // 例: 23時スロットから2スロット下にドラッグ → currentHour = 25
          // → 選択範囲は 23:00 ～ 25:00（翌日1:00）
          // 同一スロット内ドラッグの場合は最低1時間を確保
          const startH = Math.min(prev.startHour, prev.currentHour)
          const rawEndH = Math.max(prev.startHour, prev.currentHour)
          const endH = rawEndH === startH ? startH + 1 : rawEndH

          // 負の時刻（前日にまたぐ）の場合
          if (startH < 0) {
            const startDate = new Date(date)
            startDate.setDate(startDate.getDate() - 1)
            const actualStartH = 24 + startH // 例: -2 → 22時
            setActiveSlot({ date: startDate.toDateString(), hour: actualStartH, endHour: Math.min(endH, 24), endDate: dateKey })
            setModal({ isOpen: true, date: startDate, hour: actualStartH, endHour: Math.min(endH, 24), endDate: date })
          // 24時を超えた場合は翌日にまたぐイベント
          } else if (endH > 24) {
            const endDate = new Date(date)
            endDate.setDate(endDate.getDate() + 1)
            setActiveSlot({ date: dateKey, hour: startH, endHour: endH, endDate: endDate.toDateString() })
            setModal({ isOpen: true, date, hour: startH, endHour: endH - 24, endDate })
          } else {
            setActiveSlot({ date: dateKey, hour: startH, endHour: endH })
            setModal({ isOpen: true, date, hour: startH, endHour: endH })
          }
        } else {
          // クリックのみ（ドラッグなし）: 1時間のスロットを選択
          setActiveSlot({ date: dateKey, hour: prev.startHour, endHour: prev.startHour + 1 })
          setModal({ isOpen: true, date, hour: prev.startHour, endHour: prev.startHour + 1 })
        }
        return null
      })
      setAnyDrag(false)
    },
    [handleDocPointerMove, dateKey, date, setActiveSlot, setModal, setAnyDrag]
  )

  const handleSlotPointerDown = useCallback(
    (hour: number, e: React.PointerEvent) => {
      // 既にドラッグ中の場合は何もしない
      if (e.button !== 0 || drag || anyDrag) return
      e.preventDefault()
      setSelectedDate(date)
      setActiveSlot({ date: dateKey, hour })
      // startClientY を保存して相対移動量で計算できるようにする
      setSlotDrag({ startHour: hour, currentHour: hour, startClientY: e.clientY, isDragging: false })
      setHovered(null)
      setAnyDrag(true)
      document.addEventListener('pointermove', handleDocPointerMove)
      document.addEventListener('pointerup', handleDocPointerUp)
    },
    [drag, anyDrag, date, dateKey, setActiveSlot, setSelectedDate, setHovered, setAnyDrag, handleDocPointerMove, handleDocPointerUp]
  )

  const eventLeft = labelWidth > 0 ? `${labelWidth + 4}px` : '0'

  // Memoize drop target overlay calculation to avoid recalculating for unrelated re-renders
  const dropTargetOverlay = useMemo(() => {
    if (!drag) return null

    const ev = drag.originalEvent
    const eventColor = ev.color
    const colDate = new Date(date)
    colDate.setHours(0, 0, 0, 0)

    let startMinutes: number
    let endMinutes: number

    if (ev.repeat) {
      if (!ev.repeat.includes(colDate.getDay() as 0|1|2|3|4|5|6)) return null
      startMinutes = drag.currentStartTime.getHours() * 60 + drag.currentStartTime.getMinutes()
      endMinutes = drag.currentEndTime.getHours() * 60 + drag.currentEndTime.getMinutes()
    } else {
      const dragStartDate = new Date(drag.currentStartTime)
      const dragEndDate = new Date(drag.currentEndTime)
      dragStartDate.setHours(0, 0, 0, 0)
      dragEndDate.setHours(0, 0, 0, 0)
      const colTime = colDate.getTime()
      if (colTime < dragStartDate.getTime() || colTime > dragEndDate.getTime()) return null
      startMinutes = colTime === dragStartDate.getTime()
        ? drag.currentStartTime.getHours() * 60 + drag.currentStartTime.getMinutes()
        : 0
      endMinutes = colTime === dragEndDate.getTime()
        ? drag.currentEndTime.getHours() * 60 + drag.currentEndTime.getMinutes()
        : 24 * 60
    }

    const topPx = (startMinutes / 60) * slotHeight
    const heightPx = ((endMinutes - startMinutes) / 60) * slotHeight

    return (
      <div
        className={dcStyles.dropTargetOverlay}
        style={{
          top: `${topPx}px`,
          height: `${heightPx}px`,
          left: eventLeft,
          zIndex: 4,
          backgroundColor: `${eventColor}10`,
          border: `1.5px dashed ${eventColor}40`,
        }}
      />
    )
  }, [drag?.eventId, drag?.currentStartTime?.getTime(), drag?.currentEndTime?.getTime(), drag?.originalEvent, date, slotHeight, eventLeft])

  // Calculate slot drag highlight range（負の値も許可して日またぎ対応）
  const dragMin = slotDrag?.isDragging ? Math.max(0, Math.min(slotDrag.startHour, slotDrag.currentHour)) : -1
  const dragMax = slotDrag?.isDragging ? Math.min(Math.max(slotDrag.startHour, slotDrag.currentHour), 23) : -1

  return (
    <div data-component="DayColumn" style={{ overflow: 'visible' }}>
      <div className="relative" style={{ overflow: 'visible' }}>
        {HOURS.map((hour) => {
          const isCurrentHour = today && new Date().getHours() === hour
          const isActive = activeSlot?.date === dateKey && (
            activeSlot.endHour !== undefined
              ? hour >= activeSlot.hour && hour < activeSlot.endHour
              : activeSlot.hour === hour
          )
          const inDragRange = hour >= dragMin && hour <= dragMax

          return (
            <div
              key={hour}
              className={`border-b border-border/50 transition-colors cursor-pointer select-none ${
                isActive && !slotDrag ? 'bg-primary/10' : ''
              } ${!inDragRange && isCurrentHour ? dcStyles.todaySlot : ''}`}
              style={{
                height: `${slotHeight}px`,
                touchAction: 'none', // ドラッグ中のスクロールを防止
                // 他のDayColumnでドラッグ中はpointer-eventsを無効化
                pointerEvents: anyDrag && !slotDrag ? 'none' : 'auto',
                ...(labelWidth > 0 ? { display: 'grid', gridTemplateColumns: `${labelWidth}px 1fr` } : {}),
                ...(inDragRange
                  ? { backgroundColor: 'rgba(79, 70, 229, 0.1)' }
                    : {}),
              }}
              onPointerDown={(e) => handleSlotPointerDown(hour, e)}
            >
              {labelWidth > 0 && (
                <div className="text-xs text-text-secondary py-2 pr-3 text-right select-none">
                  {formatHour(hour)}
                </div>
              )}
              <div className={labelWidth > 0 ? 'border-l border-border/50' : 'border-r border-border/50'} />
            </div>
          )
        })}

        {/* Drop target highlight during event drag */}
        {dropTargetOverlay}

        {/* Drag range preview / Active slot overlay */}
        {(() => {
          // ドラッグ中の場合
          if (slotDrag?.isDragging) {
            const minH = Math.min(slotDrag.startHour, slotDrag.currentHour)
            const maxH = Math.max(slotDrag.startHour, slotDrag.currentHour)
            const rawEndH = maxH === minH ? minH + 1 : maxH
            const overlayStartHour = Math.max(0, minH)
            const overlayEndHour = rawEndH

            if (overlayEndHour <= 0) return null
            return (
              <div
                style={{
                  position: 'absolute',
                  top: `${overlayStartHour * slotHeight}px`,
                  height: `${(overlayEndHour - overlayStartHour) * slotHeight}px`,
                  left: eventLeft,
                  right: '0',
                  border: '2px solid #4f46e5',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  zIndex: 5,
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                }}
              />
            )
          }

          // 非ドラッグ時: activeSlot から表示
          if (!activeSlot) return null

          // この DayColumn が activeSlot の開始日の場合
          if (activeSlot.date === dateKey) {
            const startH = activeSlot.hour
            // 日またぎの場合は24時まで、そうでなければ endHour
            const endH = activeSlot.endDate ? 24 : (activeSlot.endHour ?? startH + 1)
            return (
              <div
                style={{
                  position: 'absolute',
                  top: `${startH * slotHeight}px`,
                  height: `${(endH - startH) * slotHeight}px`,
                  left: eventLeft,
                  right: '0',
                  border: '2px solid #4f46e5',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  zIndex: 5,
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                }}
              />
            )
          }

          // この DayColumn が activeSlot の終了日の場合（日またぎ）
          if (activeSlot.endDate === dateKey) {
            // 0時から endHour まで（endHour が 24 を超えていたら 24 - 24 = 0 から計算）
            const endH = (activeSlot.endHour ?? 24) > 24
              ? (activeSlot.endHour ?? 24) - 24
              : (activeSlot.endHour ?? 24)
            if (endH <= 0) return null
            return (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  height: `${endH * slotHeight}px`,
                  left: eventLeft,
                  right: '0',
                  border: '2px solid #4f46e5',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  zIndex: 5,
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                }}
              />
            )
          }

          return null
        })()}

        {/* Events overlay + current time indicator */}
        <div
          className="absolute top-0"
          style={{ left: eventLeft, right: '0', pointerEvents: 'none', overflow: 'visible' }}
        >
          {today && (() => {
            const now = new Date()
            const nowMinutes = now.getHours() * 60 + now.getMinutes()
            const topPx = (nowMinutes / 60) * slotHeight
            return (
              <div className="absolute left-0 right-0" style={{ top: `${topPx}px`, zIndex: 10 }}>
                <div className="h-0.5 bg-red-500">
                  <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                </div>
              </div>
            )
          })()}

          {layouted.map(({ event, column, columnSpan, totalColumns }) => (
            <EventCardContainer
              key={event.id}
              event={event}
              dayStart={dayStart}
              slotHeight={slotHeight}
              column={column}
              columnSpan={columnSpan}
              totalColumns={totalColumns}
              columnWidth={columnWidth}
              onDelete={onDeleteEvent}
              onUpdate={onUpdateEvent}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
