import { Provider, createStore } from 'jotai'
import { EventCardContainer } from './EventCardContainer'
import { eventsAtom } from '../../hooks/calendar/calendar'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/イベント/EventCardContainer',
  component: EventCardContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'イベントカードのコンテナ。レイアウト計算、ドラッグ（移動/リサイズ）、ホバー/ポップオーバー制御を担当。',
      },
    },
  },
}

const today = new Date(2026, 2, 20)
const noop = () => {}

const baseEvent: CalendarEvent = {
  id: '1',
  title: 'チームミーティング',
  startTime: new Date(2026, 2, 20, 10, 0),
  endTime: new Date(2026, 2, 20, 11, 0),
  color: '#4f46e5',
}

function createStoreWithEvents(events: CalendarEvent[]) {
  const store = createStore()
  store.set(eventsAtom, events)
  return store
}

export const Default = {
  render: () => {
    const store = createStoreWithEvents([baseEvent])
    return (
      <Provider store={store}>
        <div style={{ position: 'relative', width: '400px', height: '800px' }}>
          <EventCardContainer
            event={baseEvent}
            dayStart={today}
            slotHeight={56}
            onDelete={noop}
            onUpdate={noop}
          />
        </div>
      </Provider>
    )
  },
}

export const WithIcon = {
  render: () => {
    const event: CalendarEvent = { ...baseEvent, icon: 'users', title: 'アイコン付きイベント' }
    const store = createStoreWithEvents([event])
    return (
      <Provider store={store}>
        <div style={{ position: 'relative', width: '400px', height: '800px' }}>
          <EventCardContainer
            event={event}
            dayStart={today}
            slotHeight={56}
            onDelete={noop}
            onUpdate={noop}
          />
        </div>
      </Provider>
    )
  },
}

export const MultipleColumns = {
  render: () => {
    const events: CalendarEvent[] = [
      { ...baseEvent, id: '1', title: 'ミーティングA', color: '#4f46e5' },
      {
        id: '2',
        title: 'ミーティングB',
        startTime: new Date(2026, 2, 20, 10, 30),
        endTime: new Date(2026, 2, 20, 11, 30),
        color: '#059669',
      },
      {
        id: '3',
        title: 'ミーティングC',
        startTime: new Date(2026, 2, 20, 10, 15),
        endTime: new Date(2026, 2, 20, 10, 45),
        color: '#dc2626',
      },
    ]
    const store = createStoreWithEvents(events)
    return (
      <Provider store={store}>
        <div style={{ position: 'relative', width: '400px', height: '800px' }}>
          <EventCardContainer
            event={events[0]}
            dayStart={today}
            slotHeight={56}
            column={0}
            totalColumns={3}
            columnSpan={1}
            onDelete={noop}
            onUpdate={noop}
          />
          <EventCardContainer
            event={events[1]}
            dayStart={today}
            slotHeight={56}
            column={1}
            totalColumns={3}
            columnSpan={1}
            onDelete={noop}
            onUpdate={noop}
          />
          <EventCardContainer
            event={events[2]}
            dayStart={today}
            slotHeight={56}
            column={2}
            totalColumns={3}
            columnSpan={1}
            onDelete={noop}
            onUpdate={noop}
          />
        </div>
      </Provider>
    )
  },
}

export const ShortEvent = {
  render: () => {
    const event: CalendarEvent = {
      ...baseEvent,
      title: '15分ミーティング',
      startTime: new Date(2026, 2, 20, 9, 0),
      endTime: new Date(2026, 2, 20, 9, 15),
    }
    const store = createStoreWithEvents([event])
    return (
      <Provider store={store}>
        <div style={{ position: 'relative', width: '400px', height: '800px' }}>
          <EventCardContainer
            event={event}
            dayStart={today}
            slotHeight={56}
            onDelete={noop}
            onUpdate={noop}
          />
        </div>
      </Provider>
    )
  },
}

export const LongEvent = {
  render: () => {
    const event: CalendarEvent = {
      ...baseEvent,
      title: '終日ワークショップ',
      startTime: new Date(2026, 2, 20, 9, 0),
      endTime: new Date(2026, 2, 20, 18, 0),
      color: '#8b5cf6',
    }
    const store = createStoreWithEvents([event])
    return (
      <Provider store={store}>
        <div style={{ position: 'relative', width: '400px', height: '1400px' }}>
          <EventCardContainer
            event={event}
            dayStart={today}
            slotHeight={56}
            onDelete={noop}
            onUpdate={noop}
          />
        </div>
      </Provider>
    )
  },
}
