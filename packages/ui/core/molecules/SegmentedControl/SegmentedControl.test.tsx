import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl } from './SegmentedControl'

const OPTIONS = [
  { value: 'table', label: 'テーブル', icon: 'list' },
  { value: 'card', label: 'カード', icon: 'dashboard' },
] as const

type Value = (typeof OPTIONS)[number]['value']

describe('SegmentedControl', () => {
  it('全選択肢がラベル付きで表示される (showLabel 既定 true)', () => {
    render(
      <SegmentedControl<Value> value="table" onChange={() => {}} options={[...OPTIONS]} />,
    )
    expect(screen.getByText('テーブル')).toBeInTheDocument()
    expect(screen.getByText('カード')).toBeInTheDocument()
  })

  it('showLabel=false で icon-only になる (label は title に残る)', () => {
    render(
      <SegmentedControl<Value>
        value="table"
        onChange={() => {}}
        options={[...OPTIONS]}
        showLabel={false}
      />,
    )
    expect(screen.queryByText('テーブル')).toBeNull()
    expect(screen.getByTitle('テーブル')).toBeInTheDocument()
  })

  it('icon 未指定の選択肢はラベルのみで表示できる', () => {
    render(
      <SegmentedControl
        value="a"
        onChange={() => {}}
        options={[
          { value: 'a', label: '有効' },
          { value: 'b', label: '無効' },
        ]}
      />,
    )
    expect(screen.getByText('有効')).toBeInTheDocument()
    expect(screen.getByText('無効')).toBeInTheDocument()
  })

  it('選択中の選択肢に aria-checked が付く (radiogroup/radio)', () => {
    render(
      <SegmentedControl<Value> value="card" onChange={() => {}} options={[...OPTIONS]} />,
    )
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'カード' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'テーブル' })).toHaveAttribute('aria-checked', 'false')
  })

  it('クリックで onChange に選択値が渡る', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SegmentedControl<Value> value="table" onChange={handleChange} options={[...OPTIONS]} />,
    )
    await user.click(screen.getByRole('radio', { name: 'カード' }))
    expect(handleChange).toHaveBeenCalledWith('card')
  })

  it('disabled 時はクリックしても onChange が呼ばれない', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SegmentedControl<Value>
        value="table"
        onChange={handleChange}
        options={[...OPTIONS]}
        disabled
      />,
    )
    const btn = screen.getByRole('radio', { name: 'カード' })
    expect(btn).toBeDisabled()
    await user.click(btn)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('variant が data-variant 属性に出る', () => {
    const { container } = render(
      <SegmentedControl<Value>
        value="table"
        onChange={() => {}}
        options={[...OPTIONS]}
        variant="dark"
      />,
    )
    const el = container.querySelector('[data-component="segmented-control"]')
    expect(el).toHaveAttribute('data-variant', 'dark')
  })
})
