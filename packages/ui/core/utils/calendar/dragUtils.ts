import type { CalendarEvent } from '../../types/calendar'

const MINUTES_PER_HOUR = 60

/** Snap minutes to nearest interval */
export function snapToInterval(minutes: number, interval: number = 15): number {
  return Math.round(minutes / interval) * interval
}

/** Convert pixel delta to minute delta */
export function pxToMinutes(px: number, slotHeight: number): number {
  return (px / slotHeight) * MINUTES_PER_HOUR
}

/** Apply a time delta (in minutes) and day offset to move an event, preserving duration */
export function applyMoveDelta(
  event: CalendarEvent,
  deltaMinutes: number,
  dayOffset: number = 0
): { readonly startTime: Date; readonly endTime: Date } {
  const deltaMs = (deltaMinutes + dayOffset * 24 * MINUTES_PER_HOUR) * 60 * 1000
  return {
    startTime: new Date(event.startTime.getTime() + deltaMs),
    endTime: new Date(event.endTime.getTime() + deltaMs),
  }
}

/** Apply a time delta to resize an event from top or bottom edge */
export function applyResizeDelta(
  event: CalendarEvent,
  edge: 'top' | 'bottom',
  deltaMinutes: number,
  minDurationMinutes: number = 15
): { readonly startTime: Date; readonly endTime: Date } {
  const deltaMs = deltaMinutes * 60 * 1000
  const minMs = minDurationMinutes * 60 * 1000

  if (edge === 'top') {
    const newStart = new Date(event.startTime.getTime() + deltaMs)
    const maxStart = new Date(event.endTime.getTime() - minMs)
    return {
      startTime: newStart > maxStart ? maxStart : newStart,
      endTime: event.endTime,
    }
  }

  const newEnd = new Date(event.endTime.getTime() + deltaMs)
  const minEnd = new Date(event.startTime.getTime() + minMs)
  return {
    startTime: event.startTime,
    endTime: newEnd < minEnd ? minEnd : newEnd,
  }
}

/** Clamp event times to stay within a single day (00:00 - 23:59) */
export function clampToDay(
  startTime: Date,
  endTime: Date,
  dayDate: Date
): { readonly startTime: Date; readonly endTime: Date } {
  const dayStart = new Date(dayDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayDate)
  dayEnd.setHours(23, 59, 59, 999)

  const duration = endTime.getTime() - startTime.getTime()

  let clampedStart = startTime < dayStart ? dayStart : startTime
  let clampedEnd = endTime > dayEnd ? dayEnd : endTime

  if (clampedEnd.getTime() - clampedStart.getTime() < duration) {
    if (startTime < dayStart) {
      clampedStart = dayStart
      clampedEnd = new Date(dayStart.getTime() + duration)
      if (clampedEnd > dayEnd) clampedEnd = dayEnd
    } else {
      clampedEnd = dayEnd
      clampedStart = new Date(dayEnd.getTime() - duration)
      if (clampedStart < dayStart) clampedStart = dayStart
    }
  }

  return { startTime: clampedStart, endTime: clampedEnd }
}
