import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPicker, EVENT_COLORS } from './ColorPicker'

describe('ColorPicker', () => {
  it('renders all default color options', () => {
    render(<ColorPicker value={EVENT_COLORS[0]!.value} onChange={() => {}} />)
    const buttons = screen.getAllByRole('radio')
    expect(buttons).toHaveLength(EVENT_COLORS.length)
  })

  it('marks the selected color as checked', () => {
    render(<ColorPicker value="#059669" onChange={() => {}} />)
    const green = screen.getByRole('radio', { name: 'Green' })
    expect(green).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange with the clicked color value', () => {
    const onChange = vi.fn()
    render(<ColorPicker value={EVENT_COLORS[0]!.value} onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Red' }))
    expect(onChange).toHaveBeenCalledWith('#dc2626')
  })

  it('accepts custom colors', () => {
    const custom = [
      { value: '#000', label: 'Black' },
      { value: '#fff', label: 'White' },
    ]
    render(<ColorPicker value="#000" onChange={() => {}} colors={custom} />)
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { name: 'Black' })).toHaveAttribute('aria-checked', 'true')
  })

  it('applies custom size', () => {
    render(<ColorPicker value={EVENT_COLORS[0]!.value} onChange={() => {}} size={40} />)
    const button = screen.getAllByRole('radio')[0]!
    expect(button.style.width).toBe('40px')
    expect(button.style.height).toBe('40px')
  })

  it('has data-component attribute', () => {
    render(<ColorPicker value={EVENT_COLORS[0]!.value} onChange={() => {}} />)
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-component', 'ColorPicker')
  })
})
