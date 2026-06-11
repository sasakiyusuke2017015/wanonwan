import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimeSlotRow } from './TimeSlotRow'

describe('TimeSlotRow', () => {
  it('renders the time label', () => {
    render(<TimeSlotRow label="09:00" />)
    expect(screen.getByText('09:00')).toBeTruthy()
  })

  it('has data-component attribute', () => {
    render(<TimeSlotRow label="09:00" />)
    const el = screen.getByText('09:00').closest('[data-component]')
    expect(el).toHaveAttribute('data-component', 'time-slot-row')
  })

  it('applies default slot height', () => {
    render(<TimeSlotRow label="09:00" />)
    const el = screen.getByText('09:00').closest('[data-component]') as HTMLElement
    expect(el.style.height).toBe('56px')
  })

  it('applies custom slot height', () => {
    render(<TimeSlotRow label="09:00" slotHeight={80} />)
    const el = screen.getByText('09:00').closest('[data-component]') as HTMLElement
    expect(el.style.height).toBe('80px')
  })

  it('applies default label width', () => {
    render(<TimeSlotRow label="09:00" />)
    const el = screen.getByText('09:00').closest('[data-component]') as HTMLElement
    expect(el.style.gridTemplateColumns).toBe('64px 1fr')
  })

  it('applies custom label width', () => {
    render(<TimeSlotRow label="09:00" labelWidth={80} />)
    const el = screen.getByText('09:00').closest('[data-component]') as HTMLElement
    expect(el.style.gridTemplateColumns).toBe('80px 1fr')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<TimeSlotRow label="09:00" onClick={onClick} />)
    fireEvent.click(screen.getByText('09:00').closest('[data-component]')!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders active state indicator when isActive is true', () => {
    const { container } = render(<TimeSlotRow label="09:00" isActive />)
    const activeIndicator = container.querySelector('[class*="activeIndicator"]')
    expect(activeIndicator).toBeTruthy()
  })

  it('does not render active state indicator when isActive is false', () => {
    const { container } = render(<TimeSlotRow label="09:00" isActive={false} />)
    const activeIndicator = container.querySelector('[class*="activeIndicator"]')
    expect(activeIndicator).toBeNull()
  })

  it('renders current hour indicator when isCurrentHour is true', () => {
    const { container } = render(<TimeSlotRow label="09:00" isCurrentHour />)
    const currentIndicator = container.querySelector('[class*="currentTimeLine"]')
    expect(currentIndicator).toBeTruthy()
  })

  it('applies additional className', () => {
    render(<TimeSlotRow label="09:00" className="custom-class" />)
    const el = screen.getByText('09:00').closest('[data-component]')
    expect(el?.className).toContain('custom-class')
  })
})
