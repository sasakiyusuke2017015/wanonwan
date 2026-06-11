import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventPopover } from './EventPopover'
import type { HoveredEvent } from '../../hooks/calendar/calendar'

const mockHovered: HoveredEvent = {
  event: {
    id: '1',
    title: 'Test Event',
    startTime: new Date('2026-03-20T09:00:00'),
    endTime: new Date('2026-03-20T10:00:00'),
    color: '#4f46e5',
  },
  rect: { top: 100, left: 200, right: 400, bottom: 200, width: 200 },
}

describe('EventPopover', () => {
  it('renders the event title', () => {
    render(<EventPopover hovered={mockHovered} />)
    expect(screen.getByText('Test Event')).toBeTruthy()
  })

  it('renders formatted date and time', () => {
    render(<EventPopover hovered={mockHovered} />)
    expect(screen.getByText(/09:00/)).toBeTruthy()
    expect(screen.getByText(/10:00/)).toBeTruthy()
  })

  it('renders the color accent bar', () => {
    const { container } = render(<EventPopover hovered={mockHovered} />)
    const accentBar = container.querySelector('[style*="height: 4px"]') as HTMLElement
    expect(accentBar).toBeTruthy()
    expect(accentBar.style.background).toBe('rgb(79, 70, 229)')
  })

  it('renders description when provided', () => {
    const hoveredWithDesc: HoveredEvent = {
      ...mockHovered,
      event: { ...mockHovered.event, description: 'Important meeting notes' },
    }
    render(<EventPopover hovered={hoveredWithDesc} />)
    expect(screen.getByText('Important meeting notes')).toBeTruthy()
  })

  it('does not render description when not provided', () => {
    render(<EventPopover hovered={mockHovered} />)
    expect(screen.queryByText('Important meeting notes')).toBeNull()
  })

  it('renders all-day event text for allDay events on same day', () => {
    const allDayHovered: HoveredEvent = {
      ...mockHovered,
      event: {
        ...mockHovered.event,
        allDay: true,
        startTime: new Date('2026-03-20T00:00:00'),
        endTime: new Date('2026-03-20T23:59:59'),
      },
    }
    render(<EventPopover hovered={allDayHovered} />)
    expect(screen.getByText(/終日/)).toBeTruthy()
  })

  it('applies fixed positioning', () => {
    const { container } = render(<EventPopover hovered={mockHovered} />)
    const outerDiv = container.firstElementChild as HTMLElement
    expect(outerDiv.style.position).toBe('fixed')
  })
})
