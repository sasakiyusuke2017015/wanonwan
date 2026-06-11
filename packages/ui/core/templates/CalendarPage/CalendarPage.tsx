'use client'

import { lazy, Suspense } from 'react'
import { useAtomValue } from 'jotai'
import { viewModeAtom, hoveredEventAtom, anyDragActiveAtom } from '../../hooks/calendar/calendar'
import { CalendarHeader } from '../../organisms/CalendarHeader/CalendarHeader'
import { EventModal } from '../../organisms/EventModal/EventModal'
import { EventPopover } from '../../organisms/EventPopover/EventPopover'
import type { CalendarEvent } from '../../types/calendar'
import styles from './CalendarPage.module.scss'

const Timeline = lazy(() =>
  import('../../organisms/Timeline/Timeline').then((m) => ({ default: m.Timeline }))
)
const WeekView = lazy(() =>
  import('../../organisms/WeekView/WeekView').then((m) => ({ default: m.WeekView }))
)
const MonthView = lazy(() =>
  import('../../organisms/MonthView/MonthView').then((m) => ({ default: m.MonthView }))
)
const AgendaView = lazy(() =>
  import('../../organisms/AgendaView/AgendaView').then((m) => ({ default: m.AgendaView }))
)

export interface CalendarPageProps {
  /** イベント一覧 */
  readonly events: readonly CalendarEvent[]
  /** イベント保存 */
  readonly persistEvent: (event: CalendarEvent) => Promise<void>
  /** イベント削除 */
  readonly removeEvent: (id: string) => Promise<void>
  /** 追加の className */
  readonly className?: string
}

function ViewSwitch({
  events,
  persistEvent,
  removeEvent,
}: Omit<CalendarPageProps, 'className'>) {
  const viewMode = useAtomValue(viewModeAtom)

  const view = (() => {
    switch (viewMode) {
      case 'day':
        return (
          <Timeline
            events={events}
            headerVariant="subtle"
            persistEvent={persistEvent}
            removeEvent={removeEvent}
          />
        )
      case 'week':
        return (
          <WeekView
            events={events}
            persistEvent={persistEvent}
            removeEvent={removeEvent}
          />
        )
      case 'month':
        return (
          <MonthView
            events={events}
            persistEvent={persistEvent}
            removeEvent={removeEvent}
          />
        )
      case 'agenda':
        return (
          <AgendaView
            events={events}
            persistEvent={persistEvent}
            removeEvent={removeEvent}
          />
        )
    }
  })()

  return <Suspense fallback={null}>{view}</Suspense>
}

/**
 * カレンダーページテンプレート
 *
 * CalendarHeader + ViewSwitch (day/week/month) + EventModal + EventPopover の構成。
 * ストレージ層は呼び出し側から注入する。
 */
export function CalendarPage({
  events,
  persistEvent,
  removeEvent,
  className,
}: CalendarPageProps) {
  const hovered = useAtomValue(hoveredEventAtom)
  const anyDrag = useAtomValue(anyDragActiveAtom)

  const containerClasses = [styles.calendarPage, className].filter(Boolean).join(' ')

  return (
    <div data-component="CalendarPage" className={containerClasses}>
      <CalendarHeader />
      <main className={styles.calendarPage__main}>
        <ViewSwitch
          events={events}
          persistEvent={persistEvent}
          removeEvent={removeEvent}
        />
      </main>
      <EventModal persistEvent={persistEvent} removeEvent={removeEvent} />
      {hovered && !anyDrag && <EventPopover hovered={hovered} />}
    </div>
  )
}
