import { atom } from 'jotai'
import type { CalendarEvent, ViewMode } from '../../types/calendar'

export const eventsAtom = atom<readonly CalendarEvent[]>([])

export const selectedDateAtom = atom<Date>(new Date())

function getViewModeFromPath(): ViewMode {
  const path = window.location.pathname.replace(/^\//, '')
  if (path === 'week') return 'week'
  if (path === 'month') return 'month'
  return 'day'
}

const viewModeBaseAtom = atom<ViewMode>(getViewModeFromPath())

export const viewModeAtom = atom(
  (get) => get(viewModeBaseAtom),
  (_get, set, mode: ViewMode) => {
    set(viewModeBaseAtom, mode)
    const path = mode === 'day' ? '/' : `/${mode}`
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
  }
)

export const editingEventAtom = atom<CalendarEvent | null>(null)

export interface ModalState {
  readonly isOpen: boolean
  readonly date: Date
  readonly hour: number
  readonly endHour?: number
  readonly endDate?: Date
  readonly editingEvent?: CalendarEvent
}

export interface HoveredEvent {
  readonly event: CalendarEvent
  readonly rect: { top: number; left: number; right: number; bottom: number; width: number }
}

export const hoveredEventAtom = atom<HoveredEvent | null>(null)

export interface ActiveSlot {
  readonly date: string
  readonly hour: number
  readonly endHour?: number
  readonly endDate?: string
}

export const activeSlotAtom = atom<ActiveSlot | null>(null)

export interface DragState {
  readonly eventId: string
  readonly mode: 'move' | 'resize-top' | 'resize-bottom'
  readonly originalEvent: CalendarEvent
  readonly currentStartTime: Date
  readonly currentEndTime: Date
  readonly pointerX: number
  readonly pointerY: number
}

export const dragAtom = atom<DragState | null>(null)

// true when any drag operation is in progress (event drag, month drag, slot drag)
export const anyDragActiveAtom = atom(false)

export const eventModalAtom = atom<ModalState>({
  isOpen: false,
  date: new Date(),
  hour: 9,
})

export const addEventAtom = atom(
  null,
  (_get, set, event: CalendarEvent) => {
    set(eventsAtom, (prev) => [...prev, event])
  }
)

export const updateEventAtom = atom(
  null,
  (_get, set, updated: CalendarEvent) => {
    set(eventsAtom, (prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    )
  }
)

export const removeEventAtom = atom(
  null,
  (_get, set, id: string) => {
    set(eventsAtom, (prev) => prev.filter((e) => e.id !== id))
  }
)

export const eventsForDateAtom = atom((get) => {
  const events = get(eventsAtom)
  const selectedDate = get(selectedDateAtom)
  const dayStart = new Date(selectedDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(selectedDate)
  dayEnd.setHours(23, 59, 59, 999)

  return events.filter(
    (e) => e.startTime <= dayEnd && e.endTime >= dayStart
  )
})
