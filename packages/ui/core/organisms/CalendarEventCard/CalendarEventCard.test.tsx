import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalendarEventCard } from './CalendarEventCard'

describe('EventCard', () => {
  describe('compact variant', () => {
    it('renders title', () => {
      render(<CalendarEventCard variant="compact" title="Lunch" color="#4f46e5" />)
      expect(screen.getByText('Lunch')).toBeTruthy()
    })

    it('has data-component attribute', () => {
      render(<CalendarEventCard variant="compact" title="Lunch" color="#4f46e5" />)
      expect(screen.getByText('Lunch').closest('[data-component]')).toHaveAttribute('data-component', 'event-card')
    })

    it('applies background color', () => {
      render(<CalendarEventCard variant="compact" title="Lunch" color="#dc2626" />)
      const el = screen.getByText('Lunch').closest('[data-component]') as HTMLElement
      expect(el.style.backgroundColor).toBe('rgb(220, 38, 38)')
    })

    it('calls onClick when clicked', () => {
      const onClick = vi.fn()
      render(<CalendarEventCard variant="compact" title="Lunch" color="#4f46e5" onClick={onClick} />)
      fireEvent.click(screen.getByText('Lunch').closest('[data-component]')!)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('renders delete button when onDelete is provided', () => {
      const onDelete = vi.fn()
      render(<CalendarEventCard variant="compact" title="Lunch" color="#4f46e5" onDelete={onDelete} />)
      const deleteBtn = screen.getByRole('button', { name: 'Delete event' })
      fireEvent.click(deleteBtn)
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('does not render delete button when onDelete is not provided', () => {
      render(<CalendarEventCard variant="compact" title="Lunch" color="#4f46e5" />)
      expect(screen.queryByRole('button', { name: 'Delete event' })).toBeNull()
    })

    it('renders children', () => {
      render(
        <CalendarEventCard variant="compact" title="Lunch" color="#4f46e5">
          <span data-testid="child">extra</span>
        </CalendarEventCard>
      )
      expect(screen.getByTestId('child')).toBeTruthy()
    })
  })

  describe('timeline variant', () => {
    const baseProps = {
      title: 'Meeting',
      color: '#4f46e5',
      startLabel: '09:00',
      endLabel: '10:00',
      top: 100,
      height: 56,
    } as const

    it('renders title', () => {
      render(<CalendarEventCard {...baseProps} />)
      expect(screen.getByText('Meeting')).toBeTruthy()
    })

    it('has data-component attribute', () => {
      render(<CalendarEventCard {...baseProps} />)
      const el = screen.getByText('Meeting').closest('[data-component]')
      expect(el).toHaveAttribute('data-component', 'event-card')
    })

    it('applies positioning styles', () => {
      render(<CalendarEventCard {...baseProps} />)
      const el = screen.getByText('Meeting').closest('[data-component]') as HTMLElement
      expect(el.style.top).toBe('101px')
    })

    it('calls onClick when clicked', () => {
      const onClick = vi.fn()
      render(<CalendarEventCard {...baseProps} onClick={onClick} />)
      fireEvent.click(screen.getByText('Meeting').closest('[data-component]')!)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('renders delete button when onDelete is provided', () => {
      const onDelete = vi.fn()
      render(<CalendarEventCard {...baseProps} onDelete={onDelete} />)
      const deleteBtn = screen.getByRole('button', { name: 'Delete event' })
      fireEvent.click(deleteBtn)
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('applies percent-based positioning when leftPercent and widthPercent are set', () => {
      render(<CalendarEventCard {...baseProps} leftPercent={25} widthPercent={50} />)
      const el = screen.getByText('Meeting').closest('[data-component]') as HTMLElement
      expect(el.style.left).toContain('25%')
    })
  })
})
