import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthDayCell } from './MonthDayCell'
import type { CalendarEvent } from '../../types/calendar'

const mockEvent: CalendarEvent = {
  id: '1',
  title: 'Test Event',
  startTime: new Date('2026-03-20T09:00:00'),
  endTime: new Date('2026-03-20T10:00:00'),
  color: '#4f46e5',
}

const defaultProps = {
  date: new Date('2026-03-20'),
  selectedDate: new Date('2026-03-20'),
  events: [] as readonly CalendarEvent[],
  spanningIds: new Set<string>(),
  laneAreaH: 0,
  isActive: false,
  isDropTarget: false,
  dragEventId: null,
  todayCellClass: 'today-class',
  dropTargetClass: 'drop-target-class',
  onDayClick: vi.fn(),
  onEventClick: vi.fn(),
  onEventDragStart: vi.fn(),
}

describe('MonthDayCell', () => {
  it('renders the day number', () => {
    render(<MonthDayCell {...defaultProps} />)
    expect(screen.getByText('20')).toBeTruthy()
  })

  it('calls onDayClick when cell is clicked', () => {
    const onDayClick = vi.fn()
    render(<MonthDayCell {...defaultProps} onDayClick={onDayClick} />)
    fireEvent.click(screen.getByText('20').closest('[data-month-date]')!)
    expect(onDayClick).toHaveBeenCalledWith(defaultProps.date)
  })

  it('renders events that are not in spanningIds', () => {
    render(<MonthDayCell {...defaultProps} events={[mockEvent]} />)
    expect(screen.getByText('Test Event')).toBeTruthy()
  })

  it('does not render events that are in spanningIds', () => {
    render(<MonthDayCell {...defaultProps} events={[mockEvent]} spanningIds={new Set(['1'])} />)
    expect(screen.queryByText('Test Event')).toBeNull()
  })

  it('shows expand toggle when more than 3 timed events', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      ...mockEvent,
      id: String(i),
      title: `Event ${i}`,
    }))
    render(<MonthDayCell {...defaultProps} events={events} />)
    expect(screen.getByText('他2件の予定')).toBeTruthy()
  })

  it('expands events when toggle is clicked', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      ...mockEvent,
      id: String(i),
      title: `Event ${i}`,
    }))
    render(<MonthDayCell {...defaultProps} events={events} />)
    fireEvent.click(screen.getByText('他2件の予定'))
    expect(screen.getByText('予定を非表示')).toBeTruthy()
    expect(screen.getByText('Event 4')).toBeTruthy()
  })

  it('renders active state indicator when isActive is true', () => {
    const { container } = render(<MonthDayCell {...defaultProps} isActive />)
    expect(container.querySelector('.border-primary')).toBeTruthy()
  })

  it('renders lane area spacer when laneAreaH > 0', () => {
    const { container } = render(<MonthDayCell {...defaultProps} laneAreaH={40} />)
    const spacer = container.querySelector('[style*="height: 40px"]')
    expect(spacer).toBeTruthy()
  })

  it('sets data-month-date attribute', () => {
    const { container } = render(<MonthDayCell {...defaultProps} />)
    const cell = container.querySelector('[data-month-date]')
    expect(cell).toBeTruthy()
  })
})
