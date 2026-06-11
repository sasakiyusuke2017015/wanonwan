import { Provider } from 'jotai'
import { Timeline } from './Timeline'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/日表示/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '無限スクロール対応のタイムラインビュー。DayFrameを連続表示し、日単位でイベントを描画する。',
      },
    },
  },
}

const noop = async () => {}

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
    title: 'ランチ',
    startTime: new Date(2026, 2, 20, 12, 0),
    endTime: new Date(2026, 2, 20, 13, 0),
    color: '#059669',
  },
  {
    id: '3',
    title: 'デザインレビュー',
    startTime: new Date(2026, 2, 21, 14, 0),
    endTime: new Date(2026, 2, 21, 15, 30),
    color: '#dc2626',
  },
]

export const Default = {
  render: () => (
    <Provider>
      <div style={{ height: '100vh' }}>
        <Timeline events={mockEvents} persistEvent={noop} removeEvent={noop} />
      </div>
    </Provider>
  ),
}

export const SubtleHeader = {
  render: () => (
    <Provider>
      <div style={{ height: '100vh' }}>
        <Timeline events={mockEvents} headerVariant="subtle" persistEvent={noop} removeEvent={noop} />
      </div>
    </Provider>
  ),
}

export const BusyWeek = {
  render: () => {
    const busy: CalendarEvent[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i + 1),
      title: ['スタンドアップ', '企画会議', 'ランチ', 'コードレビュー', '1on1'][i % 5],
      startTime: new Date(2026, 2, 18 + Math.floor(i / 3), 9 + (i % 3) * 2, 0),
      endTime: new Date(2026, 2, 18 + Math.floor(i / 3), 10 + (i % 3) * 2, 0),
      color: ['#4f46e5', '#059669', '#dc2626', '#8b5cf6', '#f59e0b'][i % 5],
    }))
    return (
      <Provider>
        <div style={{ height: '100vh' }}>
          <Timeline events={busy} persistEvent={noop} removeEvent={noop} />
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
        title: '朝会（毎日）',
        startTime: new Date(2026, 2, 20, 9, 0),
        endTime: new Date(2026, 2, 20, 9, 15),
        color: '#f59e0b',
        repeat: [1, 2, 3, 4, 5] as const,
        repeatPeriodStart: new Date(2026, 2, 1),
        repeatPeriodEnd: new Date(2026, 3, 30),
      },
    ]
    return (
      <Provider>
        <div style={{ height: '100vh' }}>
          <Timeline events={events} persistEvent={noop} removeEvent={noop} />
        </div>
      </Provider>
    )
  },
}

export const Empty = {
  render: () => (
    <Provider>
      <div style={{ height: '100vh' }}>
        <Timeline events={[]} persistEvent={noop} removeEvent={noop} />
      </div>
    </Provider>
  ),
}
