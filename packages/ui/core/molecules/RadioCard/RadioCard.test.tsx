import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioCard } from './RadioCard'

describe('RadioCard', () => {
  const baseProps = {
    name: 'plan',
    value: 'basic',
    checked: false,
    onChange: () => undefined,
    title: '基本プラン',
  }

  it('title を表示する', () => {
    render(<RadioCard {...baseProps} />)
    expect(screen.getByText('基本プラン')).toBeInTheDocument()
  })

  it('description を表示する', () => {
    render(<RadioCard {...baseProps} description="月額 1,000 円のスタンダードプラン" />)
    expect(screen.getByText('月額 1,000 円のスタンダードプラン')).toBeInTheDocument()
  })

  it('description が undefined なら表示しない', () => {
    const { container } = render(<RadioCard {...baseProps} />)
    expect(container.querySelector('[data-component="radio-card-description"]')).toBeNull()
  })

  it('radio input が name / value を受け取る', () => {
    const { container } = render(<RadioCard {...baseProps} />)
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement
    expect(input.name).toBe('plan')
    expect(input.value).toBe('basic')
  })

  it('checked={true} で radio が checked になる', () => {
    const { container } = render(<RadioCard {...baseProps} checked />)
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement
    expect(input.checked).toBe(true)
  })

  it('click で onChange(value) が呼ばれる', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<RadioCard {...baseProps} onChange={handleChange} />)
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement
    await user.click(input)
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('basic')
  })

  it('disabled で操作できない + クラスが当たる', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<RadioCard {...baseProps} disabled onChange={handleChange} />)
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement
    expect(input.disabled).toBe(true)
    await user.click(input)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('className を root に伝搬する', () => {
    const { container } = render(<RadioCard {...baseProps} className="custom-cls" />)
    const root = container.querySelector('[data-component="radio-card"]')
    expect(root?.className).toMatch(/custom-cls/)
  })

  it('data-component="radio-card" 属性を持つ', () => {
    const { container } = render(<RadioCard {...baseProps} />)
    expect(container.querySelector('[data-component="radio-card"]')).toBeInTheDocument()
  })
})
