import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayOfWeekPicker } from './DayOfWeekPicker'
import type { DayOfWeek } from '../../types/calendar'

describe('DayOfWeekPicker', () => {
  const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

  it('renders all 7 day buttons', () => {
    render(<DayOfWeekPicker value={[]} onChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(7)
  })

  it('renders correct day labels', () => {
    render(<DayOfWeekPicker value={[]} onChange={() => {}} />)
    for (const label of DAY_LABELS) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })

  it('calls onChange with toggled day when a day is clicked', () => {
    const onChange = vi.fn()
    render(<DayOfWeekPicker value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('月'))
    expect(onChange).toHaveBeenCalledWith([1])
  })

  it('removes day from selection when an active day is clicked', () => {
    const onChange = vi.fn()
    render(<DayOfWeekPicker value={[1, 3] as readonly DayOfWeek[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('月'))
    expect(onChange).toHaveBeenCalledWith([3])
  })

  it('adds day and sorts the result', () => {
    const onChange = vi.fn()
    render(<DayOfWeekPicker value={[5] as readonly DayOfWeek[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('火'))
    expect(onChange).toHaveBeenCalledWith([2, 5])
  })

  it('applies active styling to selected days', () => {
    render(<DayOfWeekPicker value={[0] as readonly DayOfWeek[]} onChange={() => {}} />)
    const sundayBtn = screen.getByText('日')
    expect(sundayBtn.style.fontWeight).toBe('600')
    expect(sundayBtn.style.color).toBe('rgb(255, 255, 255)')
  })

  it('applies inactive styling to unselected days', () => {
    render(<DayOfWeekPicker value={[]} onChange={() => {}} />)
    const mondayBtn = screen.getByText('月')
    expect(mondayBtn.style.fontWeight).toBe('500')
  })
})
