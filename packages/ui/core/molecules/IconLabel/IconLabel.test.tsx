import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { IconLabel } from './IconLabel'

describe('IconLabel', () => {
  it('renders children without icon when icon is not provided', () => {
    render(<IconLabel>テスト</IconLabel>)
    expect(screen.getByText('テスト')).toBeInTheDocument()
    expect(screen.queryByTestId('IconLabel')).not.toBeInTheDocument()
  })

  it('renders icon and children when icon is provided', () => {
    const { container } = render(<IconLabel icon="calendar">予定</IconLabel>)
    expect(screen.getByText('予定')).toBeInTheDocument()
    expect(container.querySelector('[data-component="IconLabel"]')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<IconLabel icon="bell" className="custom">通知</IconLabel>)
    const el = container.querySelector('[data-component="IconLabel"]')
    expect(el?.className).toContain('custom')
  })

  it('applies iconColor as inline style', () => {
    const { container } = render(<IconLabel icon="home" iconColor="#ff0000">ホーム</IconLabel>)
    const el = container.querySelector('[data-component="IconLabel"]')
    const iconSpan = el?.querySelector('span:first-child') as HTMLElement
    expect(iconSpan.style.color).toBe('rgb(255, 0, 0)')
  })
})
