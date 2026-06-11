import { Provider, createStore } from 'jotai'
import { MonthView } from './MonthView'
import { selectedDateAtom } from '../../hooks/calendar/calendar'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/月表示/MonthView',
  component: MonthView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '月表示ビュー。カレンダーグリッド、複数日イベントのスパニングバー、イベントのドラッグ&ドロップに対応。',
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
    startTime: new Date(2026, 2, 20, 10, 0),
    endTime: new Date(2026, 2, 20, 11, 0),
    color: '#4f46e5',
  },
  {
    id: '2',
    title: '出張',
    startTime: new Date(2026, 2, 16, 0, 0),
    endTime: new Date(2026, 2, 19, 23, 59),
    color: '#059669',
    allDay: true,
  },
  {
    id: '3',
    title: 'デザインレビュー',
    startTime: new Date(2026, 2, 25, 14, 0),
    endTime: new Date(2026, 2, 25, 15, 30),
    color: '#dc2626',
  },
  {
    id: '4',
    title: 'スプリント計画',
    startTime: new Date(2026, 2, 23, 9, 0),
    endTime: new Date(2026, 2, 23, 10, 0),
    color: '#8b5cf6',
  },
]

export const Default = {
  render: () => {
    const store = createStoreWithDate(new Date(2026, 2, 20))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <MonthView events={mockEvents} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const ManySpanningEvents = {
  render: () => {
    const events: CalendarEvent[] = [
      ...mockEvents,
      {
        id: '5',
        title: '海外カンファレンス',
        startTime: new Date(2026, 2, 2, 0, 0),
        endTime: new Date(2026, 2, 6, 23, 59),
        color: '#f59e0b',
        allDay: true,
      },
      {
        id: '6',
        title: 'リリーススプリント',
        startTime: new Date(2026, 2, 9, 0, 0),
        endTime: new Date(2026, 2, 13, 23, 59),
        color: '#ec4899',
        allDay: true,
      },
      {
        id: '7',
        title: '研修',
        startTime: new Date(2026, 2, 26, 0, 0),
        endTime: new Date(2026, 2, 28, 23, 59),
        color: '#06b6d4',
        allDay: true,
      },
    ]
    const store = createStoreWithDate(new Date(2026, 2, 15))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <MonthView events={events} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const BusyMonth = {
  render: () => {
    const busy: CalendarEvent[] = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      title: `予定 ${i + 1}`,
      startTime: new Date(2026, 2, 1 + (i % 28), 9 + (i % 8), 0),
      endTime: new Date(2026, 2, 1 + (i % 28), 10 + (i % 8), 0),
      color: ['#4f46e5', '#059669', '#dc2626', '#8b5cf6', '#f59e0b'][i % 5],
    }))
    const store = createStoreWithDate(new Date(2026, 2, 15))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <MonthView events={busy} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const RepeatEvents = {
  render: () => {
    const events: CalendarEvent[] = [
      {
        id: 'repeat-1',
        title: '週次定例',
        startTime: new Date(2026, 2, 2, 10, 0),
        endTime: new Date(2026, 2, 2, 11, 0),
        color: '#4f46e5',
        repeat: [1] as const,
        repeatPeriodStart: new Date(2026, 2, 1),
        repeatPeriodEnd: new Date(2026, 2, 31),
      },
      {
        id: 'repeat-2',
        title: '朝会',
        startTime: new Date(2026, 2, 2, 9, 0),
        endTime: new Date(2026, 2, 2, 9, 15),
        color: '#059669',
        repeat: [1, 2, 3, 4, 5] as const,
        repeatPeriodStart: new Date(2026, 2, 1),
        repeatPeriodEnd: new Date(2026, 2, 31),
      },
    ]
    const store = createStoreWithDate(new Date(2026, 2, 15))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <MonthView events={events} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const Empty = {
  render: () => {
    const store = createStoreWithDate(new Date(2026, 2, 20))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh' }}>
          <MonthView events={[]} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}
