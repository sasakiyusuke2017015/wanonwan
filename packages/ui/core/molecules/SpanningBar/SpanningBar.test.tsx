import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SpanningBar } from './SpanningBar'
import type { CalendarEvent } from '../../types/calendar'

const mockEvent: CalendarEvent = {
  id: '1',
  title: 'Multi-day Event',
  startTime: new Date('2026-03-20T00:00:00'),
  endTime: new Date('2026-03-22T23:59:59'),
  color: '#4f46e5',
  allDay: true,
}

const weekDates = Array.from({ length: 7 }, (_, i) => new Date(`2026-03-${16 + i}`))

const defaultProps = {
  event: mockEvent,
  startCol: 0,
  endCol: 2,
  lane: 0,
  continuesLeft: false,
  continuesRight: false,
  isDragging: false,
  isDragActive: false,
  isHovered: false,
  onClick: vi.fn(),
  onDragStart: vi.fn(),
  onMouseEnter: vi.fn(),
  onMouseLeave: vi.fn(),
  weekDates,
}

describe('SpanningBar', () => {
  it('renders the event title', () => {
    render(<SpanningBar {...defaultProps} />)
    expect(screen.getByText('Multi-day Event')).toBeTruthy()
  })

  it('applies event color as background', () => {
    render(<SpanningBar {...defaultProps} />)
    const bar = screen.getByText('Multi-day Event')
    expect(bar.style.backgroundColor).toBe('rgb(79, 70, 229)')
  })

  it('calls onClick when bar is clicked', () => {
    const onClick = vi.fn()
    render(<SpanningBar {...defaultProps} onClick={onClick} />)
    fireEvent.click(screen.getByText('Multi-day Event'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(mockEvent, weekDates[0], expect.anything())
  })

  it('applies reduced opacity when isDragging is true', () => {
    const { container } = render(<SpanningBar {...defaultProps} isDragging />)
    const outerDiv = container.firstElementChild as HTMLElement
    expect(outerDiv.style.opacity).toBe('0.3')
  })

  it('disables pointer events when isDragActive is true', () => {
    const { container } = render(<SpanningBar {...defaultProps} isDragActive />)
    const outerDiv = container.firstElementChild as HTMLElement
    expect(outerDiv.style.pointerEvents).toBe('none')
  })

  it('renders resize handles when not continuing on either side', () => {
    const { container } = render(<SpanningBar {...defaultProps} />)
    const resizeHandles = container.querySelectorAll('[class*="resizeHandle"]')
    expect(resizeHandles).toHaveLength(2)
  })

  it('does not render left resize handle when continuesLeft is true', () => {
    const { container } = render(<SpanningBar {...defaultProps} continuesLeft />)
    const resizeHandles = container.querySelectorAll('[class*="resizeHandle"]')
    expect(resizeHandles).toHaveLength(1)
  })

  it('does not render right resize handle when continuesRight is true', () => {
    const { container } = render(<SpanningBar {...defaultProps} continuesRight />)
    const resizeHandles = container.querySelectorAll('[class*="resizeHandle"]')
    expect(resizeHandles).toHaveLength(1)
  })

  it('applies rounded corners when not continuing', () => {
    render(<SpanningBar {...defaultProps} />)
    const bar = screen.getByText('Multi-day Event')
    expect(bar.style.borderRadius).toBe('10px 10px 10px 10px')
  })

  it('removes left corners when continuesLeft', () => {
    render(<SpanningBar {...defaultProps} continuesLeft />)
    const bar = screen.getByText('Multi-day Event')
    expect(bar.style.borderRadius).toBe('0px 10px 10px 0px')
  })

  it('positions based on lane', () => {
    const { container } = render(<SpanningBar {...defaultProps} lane={2} />)
    const outerDiv = container.firstElementChild as HTMLElement
    expect(outerDiv.style.top).toBe('68px')
  })
})
