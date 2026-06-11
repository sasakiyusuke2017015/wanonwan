import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { DayFrame } from './DayFrame'
import type { CalendarEvent } from '../../types/calendar'

const defaultProps = {
  date: new Date('2026-03-20'),
  events: [] as readonly CalendarEvent[],
  onDeleteEvent: vi.fn(),
  onUpdateEvent: vi.fn(),
}

describe('DayFrame', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Provider>
        <DayFrame {...defaultProps} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders the date header', () => {
    render(
      <Provider>
        <DayFrame {...defaultProps} />
      </Provider>
    )
    const header = screen.getByRole('heading', { level: 2 })
    expect(header).toBeTruthy()
  })

  it('sets data-date attribute', () => {
    const { container } = render(
      <Provider>
        <DayFrame {...defaultProps} />
      </Provider>
    )
    const dateEl = container.querySelector('[data-date]')
    expect(dateEl).toBeTruthy()
  })

  it('sets data-sticky-header attribute', () => {
    const { container } = render(
      <Provider>
        <DayFrame {...defaultProps} />
      </Provider>
    )
    const stickyHeader = container.querySelector('[data-sticky-header]')
    expect(stickyHeader).toBeTruthy()
  })

  it('renders with blur header variant by default', () => {
    const { container } = render(
      <Provider>
        <DayFrame {...defaultProps} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders with subtle header variant', () => {
    const { container } = render(
      <Provider>
        <DayFrame {...defaultProps} headerVariant="subtle" />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })
})
