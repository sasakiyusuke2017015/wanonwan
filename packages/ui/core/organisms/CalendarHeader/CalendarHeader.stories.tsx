import { Provider, createStore } from 'jotai'
import { CalendarHeader } from './CalendarHeader'
import { viewModeAtom, selectedDateAtom } from '../../hooks/calendar/calendar'
import type { ViewMode } from '../../types/calendar'

export default {
  title: 'カレンダー/ヘッダー/CalendarHeader',
  component: CalendarHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'カレンダーのヘッダー。表示モード切替（日/週/月）、日付ナビゲーション、Today ボタンを含む。',
      },
    },
  },
}

function createStoreWith(viewMode: ViewMode, date: Date) {
  const store = createStore()
  store.set(viewModeAtom, viewMode)
  store.set(selectedDateAtom, date)
  return store
}

export const DayMode = {
  render: () => (
    <Provider store={createStoreWith('day', new Date(2026, 2, 20))}>
      <CalendarHeader />
    </Provider>
  ),
}

export const WeekMode = {
  render: () => (
    <Provider store={createStoreWith('week', new Date(2026, 2, 18))}>
      <CalendarHeader />
    </Provider>
  ),
}

export const MonthMode = {
  render: () => (
    <Provider store={createStoreWith('month', new Date(2026, 2, 1))}>
      <CalendarHeader />
    </Provider>
  ),
}

export const Today = {
  render: () => (
    <Provider store={createStoreWith('day', new Date())}>
      <CalendarHeader />
    </Provider>
  ),
}

export const FarFutureDate = {
  render: () => (
    <Provider store={createStoreWith('week', new Date(2030, 11, 25))}>
      <CalendarHeader />
    </Provider>
  ),
}
