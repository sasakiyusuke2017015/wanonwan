import { Provider, createStore } from 'jotai'
import { EventModal } from './EventModal'
import { eventModalAtom } from '../../hooks/calendar/calendar'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/イベント/EventModal',
  component: EventModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'イベントの作成・編集モーダル。タイトル、日時、カラー、説明、繰り返し設定に対応。',
      },
    },
  },
}

const noop = async () => {}

function createStoreWithModal(overrides: Partial<{
  date: Date
  hour: number
  endHour?: number
  endDate?: Date
  editingEvent?: CalendarEvent
}> = {}) {
  const store = createStore()
  store.set(eventModalAtom, {
    isOpen: true,
    date: overrides.date ?? new Date(2026, 2, 20),
    hour: overrides.hour ?? 9,
    endHour: overrides.endHour,
    endDate: overrides.endDate,
    editingEvent: overrides.editingEvent,
  })
  return store
}

export const CreateNew = {
  render: () => {
    const store = createStoreWithModal()
    return (
      <Provider store={store}>
        <EventModal persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
  },
}

export const CreateWithTimeRange = {
  render: () => {
    const store = createStoreWithModal({ hour: 14, endHour: 16 })
    return (
      <Provider store={store}>
        <EventModal persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
  },
}

export const CreateMultiDay = {
  render: () => {
    const store = createStoreWithModal({
      date: new Date(2026, 2, 20),
      hour: 0,
      endDate: new Date(2026, 2, 22),
      endHour: 24,
    })
    return (
      <Provider store={store}>
        <EventModal persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
  },
}

export const EditExisting = {
  render: () => {
    const existingEvent: CalendarEvent = {
      id: '1',
      title: 'チームミーティング',
      startTime: new Date(2026, 2, 20, 10, 0),
      endTime: new Date(2026, 2, 20, 11, 0),
      color: '#4f46e5',
      description: 'スプリントの振り返りと次の計画を話し合います。',
    }
    const store = createStoreWithModal({
      date: new Date(2026, 2, 20),
      hour: 10,
      editingEvent: existingEvent,
    })
    return (
      <Provider store={store}>
        <EventModal persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
  },
}

export const EditWithIcon = {
  render: () => {
    const existingEvent: CalendarEvent = {
      id: '2',
      title: '誕生日パーティー',
      startTime: new Date(2026, 2, 25, 18, 0),
      endTime: new Date(2026, 2, 25, 21, 0),
      color: '#ec4899',
      icon: 'cake',
      description: '🎂 サプライズパーティー！',
    }
    const store = createStoreWithModal({
      date: new Date(2026, 2, 25),
      hour: 18,
      editingEvent: existingEvent,
    })
    return (
      <Provider store={store}>
        <EventModal persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
  },
}

export const EditRepeatEvent = {
  render: () => {
    const repeatEvent: CalendarEvent = {
      id: '3',
      title: '週次定例',
      startTime: new Date(2026, 2, 20, 10, 0),
      endTime: new Date(2026, 2, 20, 11, 0),
      color: '#059669',
      repeat: [1, 3, 5] as const,
      repeatPeriodStart: new Date(2026, 2, 1),
      repeatPeriodEnd: new Date(2026, 5, 30),
    }
    const store = createStoreWithModal({
      date: new Date(2026, 2, 20),
      hour: 10,
      editingEvent: repeatEvent,
    })
    return (
      <Provider store={store}>
        <EventModal persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
  },
}

export const EditAllDay = {
  render: () => {
    const allDayEvent: CalendarEvent = {
      id: '4',
      title: '休暇',
      startTime: new Date(2026, 2, 20, 0, 0),
      endTime: new Date(2026, 2, 22, 23, 59),
      color: '#06b6d4',
      allDay: true,
    }
    const store = createStoreWithModal({
      date: new Date(2026, 2, 20),
      hour: 0,
      editingEvent: allDayEvent,
    })
    return (
      <Provider store={store}>
        <EventModal persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
  },
}
