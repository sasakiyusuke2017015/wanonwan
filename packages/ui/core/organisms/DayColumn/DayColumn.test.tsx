import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'jotai'
import { DayColumn } from './DayColumn'
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
  events: [] as readonly CalendarEvent[],
  slotHeight: 56,
  onDeleteEvent: vi.fn(),
  onUpdateEvent: vi.fn(),
}

describe('DayColumn', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Provider>
        <DayColumn {...defaultProps} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders 24 hour slots', () => {
    const { container } = render(
      <Provider>
        <DayColumn {...defaultProps} />
      </Provider>
    )
    const slots = container.querySelectorAll('.border-b')
    expect(slots.length).toBeGreaterThanOrEqual(24)
  })

  it('renders time labels when labelWidth is provided', () => {
    const { container } = render(
      <Provider>
        <DayColumn {...defaultProps} labelWidth={64} />
      </Provider>
    )
    const labels = container.querySelectorAll('.text-xs.text-text-secondary')
    expect(labels.length).toBe(24)
  })

  it('does not render time labels when labelWidth is 0', () => {
    const { container } = render(
      <Provider>
        <DayColumn {...defaultProps} labelWidth={0} />
      </Provider>
    )
    const labels = container.querySelectorAll('.text-xs.text-text-secondary')
    expect(labels.length).toBe(0)
  })

  it('renders with events', () => {
    const { container } = render(
      <Provider>
        <DayColumn {...defaultProps} events={[mockEvent]} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('applies slot height to each slot', () => {
    const { container } = render(
      <Provider>
        <DayColumn {...defaultProps} slotHeight={48} />
      </Provider>
    )
    const slot = container.querySelector('[style*="height: 48px"]')
    expect(slot).toBeTruthy()
  })
})
