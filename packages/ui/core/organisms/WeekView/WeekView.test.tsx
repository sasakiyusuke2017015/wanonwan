import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { WeekView } from './WeekView'
import type { CalendarEvent } from '../../types/calendar'

const defaultProps = {
  events: [] as readonly CalendarEvent[],
  persistEvent: vi.fn(),
  removeEvent: vi.fn(),
}

describe('WeekView', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Provider>
        <WeekView {...defaultProps} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders 7 day columns', () => {
    const { container } = render(
      <Provider>
        <WeekView {...defaultProps} />
      </Provider>
    )
    const dateColumns = container.querySelectorAll('[data-date]')
    expect(dateColumns).toHaveLength(7)
  })

  it('renders a sticky header', () => {
    const { container } = render(
      <Provider>
        <WeekView {...defaultProps} />
      </Provider>
    )
    const stickyHeader = container.querySelector('[data-sticky-header]')
    expect(stickyHeader).toBeTruthy()
  })

  it('renders time labels column', () => {
    const { container } = render(
      <Provider>
        <WeekView {...defaultProps} />
      </Provider>
    )
    const timeLabels = container.querySelectorAll('.text-xs.text-text-secondary')
    expect(timeLabels.length).toBeGreaterThanOrEqual(24)
  })

  it('renders day-of-week headers', () => {
    const { container } = render(
      <Provider>
        <WeekView {...defaultProps} />
      </Provider>
    )
    const headers = container.querySelectorAll('.text-lg.font-bold')
    expect(headers).toHaveLength(7)
  })

  it('renders with showAllDayBar prop', () => {
    const { container } = render(
      <Provider>
        <WeekView {...defaultProps} showAllDayBar={false} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders grid layout with time column and 7 day columns', () => {
    const { container } = render(
      <Provider>
        <WeekView {...defaultProps} />
      </Provider>
    )
    const gridBody = container.querySelector('.grid-cols-\\[64px_repeat\\(7\\,1fr\\)\\]')
    expect(gridBody).toBeTruthy()
  })
})
