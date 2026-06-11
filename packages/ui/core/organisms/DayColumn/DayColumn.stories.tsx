import { Provider } from 'jotai'
import { DayColumn } from './DayColumn'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/日表示/DayColumn',
  component: DayColumn,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '1日分のタイムラインカラム。24時間のスロットとイベントを表示し、スロットドラッグによるイベント作成に対応。',
      },
    },
  },
}

const today = new Date(2026, 2, 20)
const noop = () => {}

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
    startTime: new Date(2026, 2, 20, 14, 0),
    endTime: new Date(2026, 2, 20, 15, 30),
    color: '#dc2626',
  },
]

export const Default = {
  render: () => (
    <Provider>
      <div style={{ height: '600px', overflow: 'auto' }}>
        <DayColumn
          date={today}
          events={mockEvents}
          slotHeight={56}
          labelWidth={64}
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}

export const OverlappingEvents = {
  render: () => {
    const overlapping: CalendarEvent[] = [
      {
        id: '1',
        title: 'ミーティングA',
        startTime: new Date(2026, 2, 20, 10, 0),
        endTime: new Date(2026, 2, 20, 11, 30),
        color: '#4f46e5',
      },
      {
        id: '2',
        title: 'ミーティングB',
        startTime: new Date(2026, 2, 20, 10, 30),
        endTime: new Date(2026, 2, 20, 12, 0),
        color: '#059669',
      },
      {
        id: '3',
        title: 'ミーティングC',
        startTime: new Date(2026, 2, 20, 11, 0),
        endTime: new Date(2026, 2, 20, 11, 45),
        color: '#dc2626',
      },
    ]
    return (
      <Provider>
        <div style={{ height: '600px', overflow: 'auto' }}>
          <DayColumn
            date={today}
            events={overlapping}
            slotHeight={56}
            labelWidth={64}
            onDeleteEvent={noop}
            onUpdateEvent={noop}
          />
        </div>
      </Provider>
    )
  },
}

export const BusyDay = {
  render: () => {
    const busy: CalendarEvent[] = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      title: `イベント ${i + 1}`,
      startTime: new Date(2026, 2, 20, 8 + i, 0),
      endTime: new Date(2026, 2, 20, 8 + i, 45),
      color: ['#4f46e5', '#059669', '#dc2626', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'][i],
    }))
    return (
      <Provider>
        <div style={{ height: '600px', overflow: 'auto' }}>
          <DayColumn
            date={today}
            events={busy}
            slotHeight={56}
            labelWidth={64}
            onDeleteEvent={noop}
            onUpdateEvent={noop}
          />
        </div>
      </Provider>
    )
  },
}

export const EarlyMorning = {
  render: () => {
    const earlyEvents: CalendarEvent[] = [
      {
        id: '1',
        title: '早朝ジョギング',
        startTime: new Date(2026, 2, 20, 5, 30),
        endTime: new Date(2026, 2, 20, 6, 30),
        color: '#06b6d4',
      },
      {
        id: '2',
        title: '朝食',
        startTime: new Date(2026, 2, 20, 7, 0),
        endTime: new Date(2026, 2, 20, 7, 30),
        color: '#f59e0b',
      },
    ]
    return (
      <Provider>
        <div style={{ height: '600px', overflow: 'auto' }}>
          <DayColumn
            date={today}
            events={earlyEvents}
            slotHeight={56}
            labelWidth={64}
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
        <DayColumn
          date={today}
          events={[]}
          slotHeight={56}
          labelWidth={64}
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}

export const WithoutLabels = {
  render: () => (
    <Provider>
      <div style={{ height: '600px', overflow: 'auto', width: '300px' }}>
        <DayColumn
          date={today}
          events={mockEvents}
          slotHeight={56}
          onDeleteEvent={noop}
          onUpdateEvent={noop}
        />
      </div>
    </Provider>
  ),
}
