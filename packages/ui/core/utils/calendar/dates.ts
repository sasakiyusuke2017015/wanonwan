import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  eachHourOfInterval,
  startOfHour,
  endOfDay,
  getDay,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import type { DayData, TimeSlot, CalendarEvent } from '../../types/calendar'

export function generateDayData(
  date: Date,
  events: readonly CalendarEvent[]
): DayData {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const hours = eachHourOfInterval({ start: dayStart, end: dayEnd })

  const slots: TimeSlot[] = hours.map((hour) => {
    const hourStart = startOfHour(hour)
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)

    const slotEvents = events.filter((event) => {
      return event.startTime < hourEnd && event.endTime > hourStart
    })

    return {
      date: dayStart,
      hour: hour.getHours(),
      events: slotEvents,
    }
  })

  return { date: dayStart, slots }
}

export function generateDateRange(
  centerDate: Date,
  daysBefore: number,
  daysAfter: number
): readonly Date[] {
  const dates: Date[] = []
  const start = subDays(startOfDay(centerDate), daysBefore)

  for (let i = 0; i < daysBefore + daysAfter + 1; i++) {
    dates.push(addDays(start, i))
  }

  return dates
}

export function extendDateRange(
  existingDates: readonly Date[],
  direction: 'past' | 'future',
  count: number
): readonly Date[] {
  if (existingDates.length === 0) {
    return generateDateRange(new Date(), count, count)
  }

  const newDates: Date[] = []

  if (direction === 'past') {
    const earliest = existingDates[0]!
    for (let i = count; i >= 1; i--) {
      newDates.push(subDays(earliest, i))
    }
    return [...newDates, ...existingDates]
  }

  const latest = existingDates[existingDates.length - 1]!
  for (let i = 1; i <= count; i++) {
    newDates.push(addDays(latest, i))
  }
  return [...existingDates, ...newDates]
}

export function formatDayHeader(date: Date): string {
  const dayOfWeek = format(date, 'E', { locale: ja })
  const dateStr = format(date, 'M/d')
  return `${dateStr} (${dayOfWeek})`
}

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

export function getWeekDates(date: Date): readonly Date[] {
  const start = startOfDay(date)
  return eachDayOfInterval({ start, end: addDays(start, 6) })
}

export function getMonthCalendarDates(date: Date): readonly Date[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
}

export function formatMonthHeader(date: Date): string {
  return format(date, 'yyyy年M月', { locale: ja })
}

export function navigateDate(
  date: Date,
  direction: 'prev' | 'next',
  mode: 'day' | 'week' | 'month' | 'agenda'
): Date {
  const amount = direction === 'next' ? 1 : -1
  switch (mode) {
    case 'day':
      return amount > 0 ? addDays(date, 1) : subDays(date, 1)
    case 'week':
      return amount > 0 ? addWeeks(date, 1) : subWeeks(date, 1)
    case 'month':
    case 'agenda':
      return amount > 0 ? addMonths(date, 1) : subMonths(date, 1)
  }
}

/**
 * その日においてイベントが全日をカバーしているか判定
 * 例: 3/10 23:30 ~ 3/13 09:00 の場合
 *   3/10 → false (23:30開始)
 *   3/11 → true  (0:00~24:00カバー)
 *   3/12 → true  (0:00~24:00カバー)
 *   3/13 → false (09:00終了)
 */
export function coversFullDay(event: CalendarEvent, date: Date): boolean {
  // 繰り返しイベントは時刻指定扱い
  if (event.repeat) return false
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  return event.startTime <= dayStart && event.endTime >= dayEnd
}

export function getEventsForDay(
  events: readonly CalendarEvent[],
  date: Date
): readonly CalendarEvent[] {
  const ds = startOfDay(date)
  const de = endOfDay(date)
  const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
  const result: CalendarEvent[] = []
  for (const e of events) {
    if (e.repeat) {
      // 曜日マッチ かつ 期間内のみ表示
      const periodStart = startOfDay(e.startTime)
      const periodEnd = endOfDay(e.endTime)
      if (e.repeat.includes(dayOfWeek) && ds >= periodStart && de <= periodEnd) {
        // 元の時刻をこの日の日付に載せ替え
        const s = new Date(date)
        s.setHours(e.startTime.getHours(), e.startTime.getMinutes(), 0, 0)
        const en = new Date(date)
        en.setHours(e.endTime.getHours(), e.endTime.getMinutes(), 0, 0)
        result.push({ ...e, startTime: s, endTime: en, repeatPeriodStart: e.startTime, repeatPeriodEnd: e.endTime })
      }
    } else if (e.startTime <= de && e.endTime >= ds) {
      result.push(e)
    }
  }
  return result
}

export { isSameDay, isSameMonth, isToday, getDay }
