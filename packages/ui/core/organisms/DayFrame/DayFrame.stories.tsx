import { Provider } from 'jotai'
import { DayFrame } from './DayFrame'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/日表示/DayFrame',
  component: DayFrame,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '1日分のフレーム。日付ヘッダーとDayColumnを含み、スティッキーヘッダー対応。blur/subtleの2つのヘッダーバリアントを持つ。',
      },
    },
  },
}

const noop = () => {}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'モーニングスタンドアップ',
    startTime: new Date(2026, 2, 20, 9, 0),
    endTime: new Date(2026, 2, 20, 9, 30),
    color: '#4f46e5',
  },
  {
    id: '2',
    title: 'プロジェクトレビュー',
    startTime: new Date(2026, 2, 20, 14, 0),
    endTime: new Date(2026, 2, 20, 15, 30),
    color: '#059669',
  },
]

export const Default = {
  render: () => (
    <Provider>
      <div style={{ height: '600px', overflow: 'auto' }}>
        <DayFrame
          date={new Date(2026, 2, 20)}
          events={mockEvents}
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}

export const SubtleHeader = {
  render: () => (
    <Provider>
      <div style={{ height: '600px', overflow: 'auto' }}>
        <DayFrame
          date={new Date(2026, 2, 20)}
          events={mockEvents}
          headerVariant="subtle"
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}

export const Today = {
  render: () => (
    <Provider>
      <div style={{ height: '600px', overflow: 'auto' }}>
        <DayFrame
          date={new Date()}
          events={mockEvents}
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}

export const Weekend = {
  render: () => (
    <Provider>
      <div style={{ height: '600px', overflow: 'auto' }}>
        <DayFrame
          date={new Date(2026, 2, 22)}
          events={[]}
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}

export const BusyDay = {
  render: () => {
    const busy: CalendarEvent[] = Array.from({ length: 6 }, (_, i) => ({
      id: String(i + 1),
      title: ['スタンドアップ', '企画会議', 'ランチ', 'コードレビュー', '1on1', '振り返り'][i],
      startTime: new Date(2026, 2, 20, 9 + i * 1.5, 0),
      endTime: new Date(2026, 2, 20, 9 + i * 1.5 + 1, 0),
      color: ['#4f46e5', '#059669', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'][i],
    }))
    return (
      <Provider>
        <div style={{ height: '600px', overflow: 'auto' }}>
          <DayFrame
            date={new Date(2026, 2, 20)}
            events={busy}
            onDeleteEvent={noop}
            onUpdateEvent={noop}
          />
        </div>
      </Provider>
    )
  },
}

export const Empty = {
  render: () => (
    <Provider>
      <div style={{ height: '600px', overflow: 'auto' }}>
        <DayFrame
          date={new Date(2026, 2, 20)}
          events={[]}
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}
