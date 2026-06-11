import { Provider, createStore } from 'jotai'
import { WeekView } from './WeekView'
import { selectedDateAtom } from '../../hooks/calendar/calendar'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/週表示/WeekView',
  component: WeekView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '週表示ビュー。7日分のDayColumnを横並びに表示し、終日イベントバー、時間ラベルを含む。',
      },
    },
  },
}

const noop = async () => {}

function createStoreWithDate(date: Date) {
  const store = createStore()
  store.set(selectedDateAtom, date)
  return store
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'チームミーティング',
    startTime: new Date(2026, 2, 16, 10, 0),
    endTime: new Date(2026, 2, 16, 11, 0),
    color: '#4f46e5',
  },
  {
    id: '2',
    title: 'ランチ',
    startTime: new Date(2026, 2, 17, 12, 0),
    endTime: new Date(2026, 2, 17, 13, 0),
    color: '#059669',
  },
  {
    id: '3',
    title: 'デザインレビュー',
    startTime: new Date(2026, 2, 18, 14, 0),
    endTime: new Date(2026, 2, 18, 15, 30),
    color: '#dc2626',
  },
  {
    id: '4',
    title: '終日イベント',
    startTime: new Date(2026, 2, 19, 0, 0),
    endTime: new Date(2026, 2, 19, 23, 59, 59, 999),
    color: '#8b5cf6',
    allDay: true,
  },
  {
    id: '5',
    title: '1on1',
    startTime: new Date(2026, 2, 20, 15, 0),
    endTime: new Date(2026, 2, 20, 15, 30),
    color: '#f59e0b',
  },
]

export const Default = {
  render: () => {
    const store = createStoreWithDate(new Date(2026, 2, 18))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <WeekView events={mockEvents} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const MultipleAllDayEvents = {
  render: () => {
    const events: CalendarEvent[] = [
      ...mockEvents,
      {
        id: '6',
        title: '出張',
        startTime: new Date(2026, 2, 16, 0, 0),
        endTime: new Date(2026, 2, 18, 23, 59),
        color: '#ec4899',
        allDay: true,
      },
      {
        id: '7',
        title: '研修',
        startTime: new Date(2026, 2, 20, 0, 0),
        endTime: new Date(2026, 2, 21, 23, 59),
        color: '#06b6d4',
        allDay: true,
      },
    ]
    const store = createStoreWithDate(new Date(2026, 2, 18))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <WeekView events={events} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const BusyWeek = {
  render: () => {
    const busy: CalendarEvent[] = Array.from({ length: 21 }, (_, i) => ({
      id: String(i + 1),
      title: `予定 ${i + 1}`,
      startTime: new Date(2026, 2, 15 + (i % 7), 8 + Math.floor(i / 7) * 3, 0),
      endTime: new Date(2026, 2, 15 + (i % 7), 9 + Math.floor(i / 7) * 3, 0),
      color: ['#4f46e5', '#059669', '#dc2626', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'][i % 7],
    }))
    const store = createStoreWithDate(new Date(2026, 2, 18))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <WeekView events={busy} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const WithoutAllDayBar = {
  render: () => {
    const store = createStoreWithDate(new Date(2026, 2, 18))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <WeekView events={mockEvents} showAllDayBar={false} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const WithRepeatEvents = {
  render: () => {
    const events: CalendarEvent[] = [
      ...mockEvents,
      {
        id: 'repeat-1',
        title: '朝会',
        startTime: new Date(2026, 2, 16, 9, 0),
        endTime: new Date(2026, 2, 16, 9, 15),
        color: '#84cc16',
        repeat: [1, 2, 3, 4, 5] as const,
        repeatPeriodStart: new Date(2026, 2, 1),
        repeatPeriodEnd: new Date(2026, 2, 31),
      },
    ]
    const store = createStoreWithDate(new Date(2026, 2, 18))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <WeekView events={events} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const Empty = {
  render: () => {
    const store = createStoreWithDate(new Date(2026, 2, 18))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <WeekView events={[]} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}
