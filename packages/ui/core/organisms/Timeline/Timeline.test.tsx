import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'jotai'
import { Timeline } from './Timeline'
import type { CalendarEvent } from '../../types/calendar'

const defaultProps = {
  events: [] as readonly CalendarEvent[],
  persistEvent: vi.fn(),
  removeEvent: vi.fn(),
}

describe('Timeline', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Provider>
        <Timeline {...defaultProps} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders a scrollable container', () => {
    const { container } = render(
      <Provider>
        <Timeline {...defaultProps} />
      </Provider>
    )
    const scrollContainer = container.querySelector('[data-component="Timeline"]')
    expect(scrollContainer).toBeTruthy()
  })

  it('renders with headerVariant prop', () => {
    const { container } = render(
      <Provider>
        <Timeline {...defaultProps} headerVariant="subtle" />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders DayFrame components for dates', () => {
    const { container } = render(
      <Provider>
        <Timeline {...defaultProps} />
      </Provider>
    )
    const dateElements = container.querySelectorAll('[data-date]')
    expect(dateElements.length).toBeGreaterThanOrEqual(1)
  })
})
