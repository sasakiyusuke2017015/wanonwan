import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { IconPicker } from './IconPicker'

describe('IconPicker', () => {
  it('renders all icon options', () => {
    render(<IconPicker value={undefined} onChange={vi.fn()} />)
    const buttons = screen.getAllByRole('radio')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('marks selected icon as checked', () => {
    render(<IconPicker value="calendar" onChange={vi.fn()} />)
    const selected = screen.getByRole('radio', { name: 'カレンダー' })
    expect(selected).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange when icon is clicked', () => {
    const onChange = vi.fn()
    render(<IconPicker value={undefined} onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '時計' }))
    expect(onChange).toHaveBeenCalledWith('clock')
  })

  it('calls onChange with undefined when "なし" is clicked', () => {
    const onChange = vi.fn()
    render(<IconPicker value="calendar" onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: 'なし' }))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('has radiogroup role', () => {
    render(<IconPicker value={undefined} onChange={vi.fn()} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })
})
