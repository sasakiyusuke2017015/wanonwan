/** 曜日（0=日, 1=月, ..., 6=土） */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type EventMode = 'normal' | 'allDay' | 'repeat'

export interface CalendarEvent {
  readonly id: string
  readonly title: string
  readonly startTime: Date
  readonly endTime: Date
  readonly color: string
  readonly description?: string
  readonly icon?: string
  readonly allDay?: boolean
  readonly repeat?: readonly DayOfWeek[]
  readonly repeatPeriodStart?: Date
  readonly repeatPeriodEnd?: Date
}

export interface TimeSlot {
  readonly date: Date
  readonly hour: number
  readonly events: readonly CalendarEvent[]
}

export interface DayData {
  readonly date: Date
  readonly slots: readonly TimeSlot[]
}

export interface CalendarDateRange {
  readonly start: Date
  readonly end: Date
}

export type ViewMode = 'day' | 'week' | 'month' | 'agenda'
