import type { CalendarEvent } from '../../types/calendar'

export interface LayoutedEvent {
  readonly event: CalendarEvent
  /** column index within its collision group */
  readonly column: number
  /** how many columns this event spans (expands right into empty space) */
  readonly columnSpan: number
  /** total columns in the collision group */
  readonly totalColumns: number
}

/**
 * Assign column positions to overlapping events (Google Calendar style).
 *
 * Algorithm:
 * 1. Sort events by start time (tie-break by longer duration first)
 * 2. Group events that overlap into collision groups
 * 3. Within each group, greedily assign the smallest available column
 * 4. Expand each event rightward into empty adjacent columns
 */
export function layoutEvents(
  events: readonly CalendarEvent[]
): readonly LayoutedEvent[] {
  if (events.length === 0) return []

  const sorted = [...events].sort((a, b) => {
    const diff = a.startTime.getTime() - b.startTime.getTime()
    if (diff !== 0) return diff
    return b.endTime.getTime() - a.endTime.getTime()
  })

  const groups = buildCollisionGroups(sorted)

  return groups.flatMap((group) => assignColumns(group))
}

function buildCollisionGroups(
  sorted: readonly CalendarEvent[]
): readonly (readonly CalendarEvent[])[] {
  const groups: CalendarEvent[][] = []
  let currentGroup: CalendarEvent[] = []
  let groupEnd = 0

  for (const event of sorted) {
    if (currentGroup.length === 0 || event.startTime.getTime() < groupEnd) {
      currentGroup.push(event)
      groupEnd = Math.max(groupEnd, event.endTime.getTime())
    } else {
      groups.push(currentGroup)
      currentGroup = [event]
      groupEnd = event.endTime.getTime()
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return a.startTime.getTime() < b.endTime.getTime() &&
    a.endTime.getTime() > b.startTime.getTime()
}

function assignColumns(
  group: readonly CalendarEvent[]
): readonly LayoutedEvent[] {
  const columns: { endTime: number }[] = []
  const assignments: { event: CalendarEvent; column: number }[] = []

  for (const event of group) {
    const startMs = event.startTime.getTime()

    let placed = false
    for (let col = 0; col < columns.length; col++) {
      if (columns[col]!.endTime <= startMs) {
        columns[col]!.endTime = event.endTime.getTime()
        assignments.push({ event, column: col })
        placed = true
        break
      }
    }

    if (!placed) {
      columns.push({ endTime: event.endTime.getTime() })
      assignments.push({ event, column: columns.length - 1 })
    }
  }

  const totalColumns = columns.length

  return assignments.map(({ event, column }) => {
    let span = 1
    for (let nextCol = column + 1; nextCol < totalColumns; nextCol++) {
      const blocked = assignments.some(
        (other) => other.column === nextCol && eventsOverlap(event, other.event)
      )
      if (blocked) break
      span++
    }

    return {
      event,
      column,
      columnSpan: span,
      totalColumns,
    }
  })
}
