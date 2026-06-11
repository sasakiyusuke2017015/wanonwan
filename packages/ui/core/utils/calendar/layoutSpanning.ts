import { startOfDay, endOfDay } from 'date-fns'
import type { CalendarEvent } from '../../types/calendar'

export interface SpanningEvent {
  readonly event: CalendarEvent
  readonly startCol: number
  readonly endCol: number
  readonly lane: number
  readonly continuesLeft: boolean
  readonly continuesRight: boolean
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  const s = startOfDay(event.startTime).getTime()
  const e = startOfDay(event.endTime).getTime()
  return s !== e
}

export function layoutSpanningEvents(
  events: readonly CalendarEvent[],
  weekDates: readonly Date[]
): { readonly spanning: readonly SpanningEvent[]; readonly laneCount: number } {
  const weekStartMs = startOfDay(weekDates[0]!).getTime()
  const weekEndMs = startOfDay(weekDates[6]!).getTime()

  const multiDay = events.filter((ev) => {
    // 繰り返しイベントは時刻指定扱い（SpanningBarにしない）
    if (ev.repeat) return false
    const evStartMs = startOfDay(ev.startTime).getTime()
    const evEndMs = startOfDay(ev.endTime).getTime()
    if (evStartMs > weekEndMs || evEndMs < weekStartMs) return false
    // Multi-day events OR single-day events that cover a full day
    if (isMultiDayEvent(ev)) return true
    // Check if event covers full day on any day in the week
    const dayStart = startOfDay(ev.startTime)
    const dayEnd = endOfDay(ev.startTime)
    return ev.startTime <= dayStart && ev.endTime >= dayEnd
  })

  const sorted = [...multiDay].sort((a, b) => {
    const d = a.startTime.getTime() - b.startTime.getTime()
    if (d !== 0) return d
    return (b.endTime.getTime() - b.startTime.getTime()) - (a.endTime.getTime() - a.startTime.getTime())
  })

  const lanes: (string | null)[][] = []
  const result: SpanningEvent[] = []

  for (const event of sorted) {
    const evStartMs = startOfDay(event.startTime).getTime()
    const evEndMs = startOfDay(event.endTime).getTime()

    let startCol = 0
    let endCol = 6

    for (let i = 0; i < 7; i++) {
      if (startOfDay(weekDates[i]!).getTime() >= evStartMs) {
        startCol = i
        break
      }
    }

    for (let i = 6; i >= 0; i--) {
      if (startOfDay(weekDates[i]!).getTime() <= evEndMs) {
        endCol = i
        break
      }
    }

    const continuesLeft = evStartMs < weekStartMs
    const continuesRight = evEndMs > weekEndMs

    let lane = -1
    for (let l = 0; l < lanes.length; l++) {
      let free = true
      for (let c = startCol; c <= endCol; c++) {
        if (lanes[l]![c] !== null) { free = false; break }
      }
      if (free) { lane = l; break }
    }
    if (lane === -1) {
      lane = lanes.length
      lanes.push(Array(7).fill(null))
    }

    for (let c = startCol; c <= endCol; c++) {
      lanes[lane]![c] = event.id
    }

    result.push({ event, startCol, endCol, lane, continuesLeft, continuesRight })
  }

  return { spanning: result, laneCount: lanes.length }
}
