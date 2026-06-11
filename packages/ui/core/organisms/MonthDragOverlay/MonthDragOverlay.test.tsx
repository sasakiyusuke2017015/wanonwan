import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MonthDragOverlay } from './MonthDragOverlay'
import type { CalendarEvent } from '../../types/calendar'

const mockEvent: CalendarEvent = {
  id: '1',
  title: 'テストイベント',
  startTime: new Date(2026, 2, 20, 10, 0),
  endTime: new Date(2026, 2, 20, 11, 0),
  color: '#4f46e5',
}

const mockPointer = { x: 100, y: 200 }

describe('MonthDragOverlay', () => {
  it('renders nothing when event is null', () => {
    const { container } = render(
      <MonthDragOverlay event={null} initialPointer={mockPointer} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when initialPointer is null', () => {
    const { container } = render(
      <MonthDragOverlay event={mockEvent} initialPointer={null} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders ghost when both event and pointer are provided', () => {
    render(
      <MonthDragOverlay event={mockEvent} initialPointer={mockPointer} />
    )
    const ghost = document.querySelector('[data-component="MonthDragOverlay"]')
    expect(ghost).toBeTruthy()
    expect(ghost?.textContent).toContain('テストイベント')
  })

  it('has data-component attribute', () => {
    render(
      <MonthDragOverlay event={mockEvent} initialPointer={mockPointer} />
    )
    const el = document.querySelector('[data-component="MonthDragOverlay"]')
    expect(el).toBeTruthy()
    expect(el?.getAttribute('data-component')).toBe('MonthDragOverlay')
  })
})
