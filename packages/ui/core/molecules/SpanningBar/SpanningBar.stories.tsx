import { SpanningBar } from './SpanningBar'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/ドラッグ/SpanningBar',
  component: SpanningBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '月表示で複数日にまたがるイベントを横長バーとして表示するコンポーネント。リサイズハンドル付き。',
      },
    },
  },
}

const weekDates = Array.from({ length: 7 }, (_, i) => new Date(2026, 2, 15 + i))

const mockEvent: CalendarEvent = {
  id: '1',
  title: '出張',
  startTime: new Date(2026, 2, 16, 0, 0),
  endTime: new Date(2026, 2, 19, 23, 59),
  color: '#4f46e5',
  allDay: true,
}

const noop = () => {}

export const Default = {
  render: () => (
    <div style={{ position: 'relative', width: '700px', height: '80px' }}>
      <SpanningBar
        event={mockEvent}
        startCol={1}
        endCol={4}
        lane={0}
        continuesLeft={false}
        continuesRight={false}
        isDragging={false}
        isDragActive={false}
        isHovered={false}
        onClick={noop}
        onDragStart={noop}
        onMouseEnter={noop}
        onMouseLeave={noop}
        weekDates={weekDates}
      />
    </div>
  ),
}

export const ContinuesLeft = {
  render: () => (
    <div style={{ position: 'relative', width: '700px', height: '80px' }}>
      <SpanningBar
        event={{ ...mockEvent, title: '前週から続く予定' }}
        startCol={0}
        endCol={2}
        lane={0}
        continuesLeft={true}
        continuesRight={false}
        isDragging={false}
        isDragActive={false}
        isHovered={false}
        onClick={noop}
        onDragStart={noop}
        onMouseEnter={noop}
        onMouseLeave={noop}
        weekDates={weekDates}
      />
    </div>
  ),
}

export const ContinuesRight = {
  render: () => (
    <div style={{ position: 'relative', width: '700px', height: '80px' }}>
      <SpanningBar
        event={{ ...mockEvent, title: '来週へ続く予定' }}
        startCol={4}
        endCol={6}
        lane={0}
        continuesLeft={false}
        continuesRight={true}
        isDragging={false}
        isDragActive={false}
        isHovered={false}
        onClick={noop}
        onDragStart={noop}
        onMouseEnter={noop}
        onMouseLeave={noop}
        weekDates={weekDates}
      />
    </div>
  ),
}

export const MultipleLanes = {
  render: () => {
    const event2: CalendarEvent = {
      id: '2',
      title: '休暇',
      startTime: new Date(2026, 2, 17, 0, 0),
      endTime: new Date(2026, 2, 20, 23, 59),
      color: '#059669',
      allDay: true,
    }
    return (
      <div style={{ position: 'relative', width: '700px', height: '100px' }}>
        <SpanningBar
          event={mockEvent}
          startCol={1}
          endCol={4}
          lane={0}
          continuesLeft={false}
          continuesRight={false}
          isDragging={false}
          isDragActive={false}
          onClick={noop}
          onDragStart={noop}
          weekDates={weekDates}
        />
        <SpanningBar
          event={event2}
          startCol={2}
          endCol={5}
          lane={1}
          continuesLeft={false}
          continuesRight={false}
          isDragging={false}
          isDragActive={false}
          onClick={noop}
          onDragStart={noop}
          weekDates={weekDates}
        />
      </div>
    )
  },
}

export const Dragging = {
  render: () => (
    <div style={{ position: 'relative', width: '700px', height: '80px' }}>
      <SpanningBar
        event={mockEvent}
        startCol={1}
        endCol={4}
        lane={0}
        continuesLeft={false}
        continuesRight={false}
        isDragging={true}
        isDragActive={true}
        isHovered={false}
        onClick={noop}
        onDragStart={noop}
        onMouseEnter={noop}
        onMouseLeave={noop}
        weekDates={weekDates}
      />
    </div>
  ),
}
