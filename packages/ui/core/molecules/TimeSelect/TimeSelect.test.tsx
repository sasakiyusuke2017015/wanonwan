import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimeSelect } from './TimeSelect'

describe('TimeSelect', () => {
  it('renders a select element', () => {
    render(<TimeSelect value={540} onChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeTruthy()
  })

  it('renders 96 time options (every 15 minutes)', () => {
    render(<TimeSelect value={540} onChange={() => {}} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(96)
  })

  it('has correct first option (00:00)', () => {
    render(<TimeSelect value={0} onChange={() => {}} />)
    const firstOption = screen.getAllByRole('option')[0]
    expect(firstOption?.textContent).toBe('00:00')
  })

  it('has correct last option (23:45)', () => {
    render(<TimeSelect value={0} onChange={() => {}} />)
    const options = screen.getAllByRole('option')
    expect(options[95]?.textContent).toBe('23:45')
  })

  it('selects the correct value (09:00 = 540 minutes)', () => {
    render(<TimeSelect value={540} onChange={() => {}} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('540')
  })

  it('calls onChange with number value when selection changes', () => {
    const onChange = vi.fn()
    render(<TimeSelect value={540} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '600' } })
    expect(onChange).toHaveBeenCalledWith(600)
  })

  it('applies error border style when error is true', () => {
    render(<TimeSelect value={540} onChange={() => {}} error />)
    const select = screen.getByRole('combobox') as HTMLElement
    expect(select.style.borderColor).toBe('rgb(220, 38, 38)')
  })

  it('does not apply error style when error is false', () => {
    render(<TimeSelect value={540} onChange={() => {}} />)
    const select = screen.getByRole('combobox') as HTMLElement
    expect(select.style.borderColor).toBe('')
  })

  it('applies additional className', () => {
    render(<TimeSelect value={540} onChange={() => {}} className="custom" />)
    const select = screen.getByRole('combobox')
    expect(select.className).toContain('custom')
  })
})
