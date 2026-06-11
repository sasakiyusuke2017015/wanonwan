import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PillSelect } from './PillSelect'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('PillSelect', () => {
  it('renders all options', () => {
    render(<PillSelect options={options} value="a" onChange={() => {}} />)
    expect(screen.getByText('Option A')).toBeTruthy()
    expect(screen.getByText('Option B')).toBeTruthy()
    expect(screen.getByText('Option C')).toBeTruthy()
  })

  it('renders correct number of buttons', () => {
    render(<PillSelect options={options} value="a" onChange={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('calls onChange with the correct value when a pill is clicked', () => {
    const onChange = vi.fn()
    render(<PillSelect options={options} value="a" onChange={onChange} />)
    fireEvent.click(screen.getByText('Option B'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('applies active styling to selected pill', () => {
    render(<PillSelect options={options} value="b" onChange={() => {}} />)
    const activeBtn = screen.getByText('Option B')
    expect(activeBtn.style.fontWeight).toBe('600')
  })

  it('applies inactive styling to non-selected pills', () => {
    render(<PillSelect options={options} value="b" onChange={() => {}} />)
    const inactiveBtn = screen.getByText('Option A')
    expect(inactiveBtn.style.fontWeight).toBe('400')
  })

  it('renders with empty options array', () => {
    const { container } = render(<PillSelect options={[]} value="" onChange={() => {}} />)
    expect(container.querySelector('[data-component="PillSelect"]')).toBeTruthy()
  })
})
