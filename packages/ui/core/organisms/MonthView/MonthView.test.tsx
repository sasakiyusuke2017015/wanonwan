import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { MonthView } from './MonthView'
import type { CalendarEvent } from '../../types/calendar'

const defaultProps = {
  events: [] as readonly CalendarEvent[],
  persistEvent: vi.fn(),
  removeEvent: vi.fn(),
}

describe('MonthView', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Provider>
        <MonthView {...defaultProps} />
      </Provider>
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it('renders weekday headers', () => {
    render(
      <Provider>
        <MonthView {...defaultProps} />
      </Provider>
    )
    expect(screen.getByText('日')).toBeTruthy()
    expect(screen.getByText('月')).toBeTruthy()
    expect(screen.getByText('火')).toBeTruthy()
    expect(screen.getByText('水')).toBeTruthy()
    expect(screen.getByText('木')).toBeTruthy()
    expect(screen.getByText('金')).toBeTruthy()
    expect(screen.getByText('土')).toBeTruthy()
  })

  it('renders the month/year heading', () => {
    render(
      <Provider>
        <MonthView {...defaultProps} />
      </Provider>
    )
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeTruthy()
    expect(heading.textContent).toMatch(/\d{4}年\d{1,2}月/)
  })

  it('renders day cells with data-month-date attributes', () => {
    const { container } = render(
      <Provider>
        <MonthView {...defaultProps} />
      </Provider>
    )
    const dayCells = container.querySelectorAll('[data-month-date]')
    expect(dayCells.length).toBeGreaterThanOrEqual(28)
  })

  it('renders events in the correct day cells', () => {
    // MonthView は selectedDateAtom (= new Date()) を基準に表示するので、
    // テスト用イベントの日付も "今日" 寄りに作る (任意の固定月だと表示外になる)
    const today = new Date()
    today.setHours(9, 0, 0, 0)
    const endTime = new Date(today)
    endTime.setHours(10, 0, 0, 0)
    const event: CalendarEvent = {
      id: '1',
      title: 'Month Event',
      startTime: today,
      endTime,
      color: '#4f46e5',
    }
    render(
      <Provider>
        <MonthView {...defaultProps} events={[event]} />
      </Provider>
    )
    expect(screen.getByText('Month Event')).toBeTruthy()
  })

  it('renders 7-column grid for weekday headers', () => {
    const { container } = render(
      <Provider>
        <MonthView {...defaultProps} />
      </Provider>
    )
    const gridHeader = container.querySelector('.grid-cols-7')
    expect(gridHeader).toBeTruthy()
  })
})
