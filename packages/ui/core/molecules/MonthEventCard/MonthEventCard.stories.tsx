import { MonthEventCard } from './MonthEventCard'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/イベント/MonthEventCard',
  component: MonthEventCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '月表示の時間指定イベントカード。ドット、時刻、タイトルを表示する。',
      },
    },
  },
}

const mockEvent: CalendarEvent = {
  id: '1',
  title: 'チームミーティング',
  startTime: new Date(2026, 2, 20, 10, 0),
  endTime: new Date(2026, 2, 20, 11, 0),
  color: '#4f46e5',
}

export const Default = {
  render: () => (
    <div style={{ width: '180px' }}>
      <MonthEventCard
        event={mockEvent}
        isDragging={false}
        onClick={() => {}}
        onPointerDown={() => {}}
      />
    </div>
  ),
}

export const Dragging = {
  render: () => (
    <div style={{ width: '180px' }}>
      <MonthEventCard
        event={mockEvent}
        isDragging={true}
        onClick={() => {}}
        onPointerDown={() => {}}
      />
    </div>
  ),
}

export const DifferentColors = {
  render: () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'デザインレビュー', startTime: new Date(2026, 2, 20, 9, 0), endTime: new Date(2026, 2, 20, 10, 0), color: '#059669' },
      { id: '2', title: 'ランチ', startTime: new Date(2026, 2, 20, 12, 0), endTime: new Date(2026, 2, 20, 13, 0), color: '#dc2626' },
      { id: '3', title: '1on1', startTime: new Date(2026, 2, 20, 15, 30), endTime: new Date(2026, 2, 20, 16, 0), color: '#8b5cf6' },
    ]
    return (
      <div style={{ width: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {events.map((event) => (
          <MonthEventCard
            key={event.id}
            event={event}
            isDragging={false}
            onClick={() => {}}
            onPointerDown={() => {}}
          />
        ))}
      </div>
    )
  },
}
