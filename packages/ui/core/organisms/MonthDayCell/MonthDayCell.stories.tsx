import { MonthDayCell } from './MonthDayCell'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/月表示/MonthDayCell',
  component: MonthDayCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '月表示の1日分のセル。日付ラベル、イベントカード、展開/折りたたみ機能を持つ。',
      },
    },
  },
}

const today = new Date(2026, 2, 20)

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'ミーティング', startTime: new Date(2026, 2, 20, 10, 0), endTime: new Date(2026, 2, 20, 11, 0), color: '#4f46e5' },
  { id: '2', title: 'ランチ', startTime: new Date(2026, 2, 20, 12, 0), endTime: new Date(2026, 2, 20, 13, 0), color: '#059669' },
]

const noop = () => {}

export const Default = {
  render: () => (
    <div style={{ width: '160px', height: '140px' }}>
      <MonthDayCell
        date={today}
        selectedDate={today}
        events={mockEvents}
        spanningIds={new Set()}
        laneAreaH={0}
        isActive={false}
        isDropTarget={false}
        dragEventId={null}
        todayCellClass=""
        dropTargetClass=""
        onDayClick={noop}
        onEventClick={noop}
        onEventDragStart={noop}
      />
    </div>
  ),
}

export const Active = {
  render: () => (
    <div style={{ width: '160px', height: '140px' }}>
      <MonthDayCell
        date={today}
        selectedDate={today}
        events={mockEvents}
        spanningIds={new Set()}
        laneAreaH={0}
        isActive={true}
        isDropTarget={false}
        dragEventId={null}
        todayCellClass=""
        dropTargetClass=""
        onDayClick={noop}
        onEventClick={noop}
        onEventDragStart={noop}
      />
    </div>
  ),
}

export const ManyEvents = {
  render: () => {
    const events: CalendarEvent[] = [
      { id: '1', title: '朝会', startTime: new Date(2026, 2, 20, 9, 0), endTime: new Date(2026, 2, 20, 9, 30), color: '#4f46e5' },
      { id: '2', title: 'レビュー', startTime: new Date(2026, 2, 20, 10, 0), endTime: new Date(2026, 2, 20, 11, 0), color: '#059669' },
      { id: '3', title: 'ランチ', startTime: new Date(2026, 2, 20, 12, 0), endTime: new Date(2026, 2, 20, 13, 0), color: '#dc2626' },
      { id: '4', title: '1on1', startTime: new Date(2026, 2, 20, 15, 0), endTime: new Date(2026, 2, 20, 15, 30), color: '#8b5cf6' },
      { id: '5', title: '夕会', startTime: new Date(2026, 2, 20, 17, 0), endTime: new Date(2026, 2, 20, 17, 30), color: '#f59e0b' },
    ]
    return (
      <div style={{ width: '160px', height: '200px' }}>
        <MonthDayCell
          date={today}
          selectedDate={today}
          events={events}
          spanningIds={new Set()}
          laneAreaH={0}
          isActive={false}
          isDropTarget={false}
          dragEventId={null}
          todayCellClass=""
          dropTargetClass=""
          onDayClick={noop}
          onEventClick={noop}
          onEventDragStart={noop}
        />
      </div>
    )
  },
}

export const Empty = {
  render: () => (
    <div style={{ width: '160px', height: '100px' }}>
      <MonthDayCell
        date={today}
        selectedDate={today}
        events={[]}
        spanningIds={new Set()}
        laneAreaH={0}
        isActive={false}
        isDropTarget={false}
        dragEventId={null}
        todayCellClass=""
        dropTargetClass=""
        onDayClick={noop}
        onEventClick={noop}
        onEventDragStart={noop}
      />
    </div>
  ),
}
