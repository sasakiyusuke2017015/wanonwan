import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthEventCard } from './MonthEventCard'
import type { CalendarEvent } from '../../types/calendar'

const mockEvent: CalendarEvent = {
  id: '1',
  title: 'Test Event',
  startTime: new Date('2026-03-20T09:00:00'),
  endTime: new Date('2026-03-20T10:00:00'),
  color: '#4f46e5',
}

describe('MonthEventCard', () => {
  const defaultProps = {
    event: mockEvent,
    isDragging: false,
    isHovered: false,
    onClick: vi.fn(),
    onPointerDown: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
  }

  it('renders event title', () => {
    render(<MonthEventCard {...defaultProps} />)
    expect(screen.getByText('Test Event')).toBeTruthy()
  })

  it('has data-component attribute', () => {
    render(<MonthEventCard {...defaultProps} />)
    expect(screen.getByText('Test Event').closest('[data-component]')).toHaveAttribute('data-component', 'event-card')
  })

  it('displays formatted start and end times', () => {
    render(<MonthEventCard {...defaultProps} />)
    expect(screen.getByText('09:00 - 10:00')).toBeTruthy()
  })

  it('applies event color via Icon', () => {
    const { container } = render(<MonthEventCard {...defaultProps} />)
    const icon = container.querySelector('[data-component="event-card"] > span:first-child, [data-component="event-card"] > svg') as HTMLElement
    expect(icon).toBeTruthy()
  })

  it('applies reduced opacity when isDragging is true', () => {
    render(<MonthEventCard {...defaultProps} isDragging />)
    const card = screen.getByText('Test Event').closest('[data-component]') as HTMLElement
    expect(card.style.opacity).toBe('0.3')
  })

  it('applies hover styles when isHovered is true', () => {
    const { container } = render(<MonthEventCard {...defaultProps} isHovered />)
    const card = container.querySelector('[data-component="event-card"]') as HTMLElement
    expect(card.style.backgroundColor).toBeTruthy()
    expect(card.style.boxShadow).toContain('inset')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<MonthEventCard {...defaultProps} onClick={onClick} />)
    fireEvent.click(screen.getByText('Test Event').closest('[data-component]')!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onPointerDown on pointer down', () => {
    const onPointerDown = vi.fn()
    render(<MonthEventCard {...defaultProps} onPointerDown={onPointerDown} />)
    fireEvent.pointerDown(screen.getByText('Test Event').closest('[data-component]')!)
    expect(onPointerDown).toHaveBeenCalledTimes(1)
  })

  it('calls onMouseEnter and onMouseLeave', () => {
    const onMouseEnter = vi.fn()
    const onMouseLeave = vi.fn()
    render(<MonthEventCard {...defaultProps} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />)
    const card = screen.getByText('Test Event').closest('[data-component]')!
    fireEvent.mouseEnter(card)
    expect(onMouseEnter).toHaveBeenCalledTimes(1)
    fireEvent.mouseLeave(card)
    expect(onMouseLeave).toHaveBeenCalledTimes(1)
  })
})
