import { useCallback, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { dragAtom, anyDragActiveAtom, hoveredEventAtom } from './calendar'
import {
  pxToMinutes,
  snapToInterval,
  applyMoveDelta,
  applyResizeDelta,
} from '../../utils/calendar/dragUtils'
import type { CalendarEvent } from '../../types/calendar'
import { getEffectiveDayOffset, resolveOriginalEvent } from '../../utils/calendar/repeatUtils'

const DRAG_THRESHOLD = 5

interface UseDragEventOptions {
  readonly event: CalendarEvent
  readonly slotHeight: number
  /** Day column width in px. Required for cross-day dragging. */
  readonly columnWidth?: number
  /** All events (needed to resolve repeat event originals) */
  readonly allEvents?: readonly CalendarEvent[]
  readonly onCommit: (updated: CalendarEvent) => void
  readonly onClick?: () => void
}

export function useDragEvent({ event, slotHeight, columnWidth, allEvents, onCommit, onClick }: UseDragEventOptions) {
  const setDrag = useSetAtom(dragAtom)
  const setAnyDrag = useSetAtom(anyDragActiveAtom)
  const setHovered = useSetAtom(hoveredEventAtom)
  const stateRef = useRef<{
    mode: 'move' | 'resize-top' | 'resize-bottom'
    startX: number
    startY: number
    started: boolean
  } | null>(null)

  // Store listener refs so all handlers can remove each other
  const listenersRef = useRef<{
    move: (e: PointerEvent) => void
    up: () => void
    key: (e: KeyboardEvent) => void
  } | null>(null)

  const removeAllListeners = useCallback(() => {
    const listeners = listenersRef.current
    if (!listeners) return
    document.removeEventListener('pointermove', listeners.move)
    document.removeEventListener('pointerup', listeners.up)
    document.removeEventListener('keydown', listeners.key)
    listenersRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    setAnyDrag(false)
  }, [setAnyDrag])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const state = stateRef.current
      if (!state) return

      const deltaX = e.clientX - state.startX
      const deltaY = e.clientY - state.startY

      if (!state.started) {
        if (Math.abs(deltaY) < DRAG_THRESHOLD && Math.abs(deltaX) < DRAG_THRESHOLD) return
        state.started = true
        setAnyDrag(true)
        setHovered(null)
        document.body.style.cursor =
          state.mode === 'move' ? 'grabbing' : state.mode === 'resize-top' ? 'n-resize' : 's-resize'
        document.body.style.userSelect = 'none'
      }

      const rawMinutes = pxToMinutes(deltaY, slotHeight)
      const snappedMinutes = snapToInterval(rawMinutes, 15)
      // 繰り返しイベントは曜日固定、時刻のみ移動
      const rawDayOffset = columnWidth && state.mode === 'move' ? Math.round(deltaX / columnWidth) : 0
      const dayOffset = getEffectiveDayOffset(event, rawDayOffset)

      const newTimes =
        state.mode === 'move'
          ? applyMoveDelta(event, snappedMinutes, dayOffset)
          : applyResizeDelta(event, state.mode === 'resize-top' ? 'top' : 'bottom', snappedMinutes)

      setDrag({
        eventId: event.id,
        mode: state.mode,
        originalEvent: event,
        currentStartTime: newTimes.startTime,
        currentEndTime: newTimes.endTime,
        pointerX: e.clientX,
        pointerY: e.clientY,
      })
    },
    [event, slotHeight, columnWidth, setDrag, setAnyDrag, setHovered]
  )

  const handlePointerUp = useCallback(
    () => {
      const state = stateRef.current
      stateRef.current = null

      removeAllListeners()

      if (!state?.started) {
        setDrag(null)
        onClick?.()
        return
      }

      setDrag((current) => {
        if (current && current.eventId === event.id) {
          const hasChanged =
            current.currentStartTime.getTime() !== event.startTime.getTime() ||
            current.currentEndTime.getTime() !== event.endTime.getTime()

          if (hasChanged) {
            if (event.repeat && allEvents) {
              // 繰り返しイベント: 時間デルタを元イベントの期間に適用
              const original = resolveOriginalEvent(event, allEvents)
              const startDelta = current.currentStartTime.getTime() - event.startTime.getTime()
              const newStart = new Date(original.startTime.getTime() + startDelta)
              newStart.setHours(current.currentStartTime.getHours(), current.currentStartTime.getMinutes(), 0, 0)
              const newEnd = new Date(original.endTime.getTime() + startDelta)
              newEnd.setHours(current.currentEndTime.getHours(), current.currentEndTime.getMinutes(), 0, 0)
              onCommit({ ...original, startTime: newStart, endTime: newEnd })
            } else {
              onCommit({
                ...event,
                startTime: current.currentStartTime,
                endTime: current.currentEndTime,
              })
            }
          }
        }
        return null
      })
    },
    [event, removeAllListeners, setDrag, onCommit, onClick]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      stateRef.current = null
      removeAllListeners()
      setDrag(null)
    },
    [removeAllListeners, setDrag]
  )

  const startDrag = useCallback(
    (mode: 'move' | 'resize-top' | 'resize-bottom') =>
      (e: React.PointerEvent) => {
        if (e.button !== 0) return
        e.stopPropagation()
        e.preventDefault()

        stateRef.current = {
          mode,
          startX: e.clientX,
          startY: e.clientY,
          started: false,
        }

        const listeners = {
          move: handlePointerMove,
          up: handlePointerUp,
          key: handleKeyDown,
        }
        listenersRef.current = listeners

        document.addEventListener('pointermove', listeners.move)
        document.addEventListener('pointerup', listeners.up)
        document.addEventListener('keydown', listeners.key)
      },
    [handlePointerMove, handlePointerUp, handleKeyDown]
  )

  return {
    handleMoveStart: startDrag('move'),
    handleResizeTopStart: startDrag('resize-top'),
    handleResizeBottomStart: startDrag('resize-bottom'),
  }
}
