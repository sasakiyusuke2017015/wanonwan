import { MonthDragOverlay } from './MonthDragOverlay'
import type { CalendarEvent } from '../../types/calendar'

export default {
  title: 'カレンダー/ドラッグ/MonthDragOverlay',
  component: MonthDragOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'ドラッグ中にポインタに追従するゴースト表示。createPortal で body 直下に描画される。',
      },
    },
  },
}

const baseEvent: CalendarEvent = {
  id: '1',
  title: 'チームミーティング',
  startTime: new Date(2026, 2, 20, 10, 0),
  endTime: new Date(2026, 2, 20, 11, 0),
  color: '#4f46e5',
}

const pointer = { x: 200, y: 300 }

export const Default = {
  render: () => (
    <MonthDragOverlay event={baseEvent} initialPointer={pointer} />
  ),
}

export const Red = {
  render: () => (
    <MonthDragOverlay
      event={{ ...baseEvent, id: '2', title: '締切', color: '#dc2626' }}
      initialPointer={pointer}
    />
  ),
}

export const Green = {
  render: () => (
    <MonthDragOverlay
      event={{ ...baseEvent, id: '3', title: 'ランチ', color: '#16a34a' }}
      initialPointer={pointer}
    />
  ),
}

export const NoEvent = {
  render: () => (
    <MonthDragOverlay event={null} initialPointer={pointer} />
  ),
}
