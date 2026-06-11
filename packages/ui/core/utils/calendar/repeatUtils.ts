import type { CalendarEvent } from '../../types/calendar'

/**
 * 繰り返しイベントの不変条件:
 * - 曜日固定 (repeat配列で指定)
 * - 時刻のみ変更可能
 * - 日をまたぐ移動不可 (dayOffset常に0)
 * - 月表示でSpanningBarにならない
 */

/** 仮想インスタンスから元イベントを取得 */
export function resolveOriginalEvent(
  event: CalendarEvent,
  allEvents: readonly CalendarEvent[]
): CalendarEvent {
  if (!event.repeat) return event
  return allEvents.find((e) => e.id === event.id) ?? event
}

/** 繰り返しイベントは日をまたぐ移動不可 */
export function getEffectiveDayOffset(event: CalendarEvent, dayOffset: number): number {
  return event.repeat ? 0 : dayOffset
}
