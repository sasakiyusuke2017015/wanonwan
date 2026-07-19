import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPill } from './StatusPill'

describe('StatusPill', () => {
  it('label を表示する', () => {
    render(<StatusPill tone="success" label="有効" />)
    expect(screen.getByText('有効')).toBeInTheDocument()
  })

  it('children を表示する', () => {
    render(<StatusPill tone="info">未受験</StatusPill>)
    expect(screen.getByText('未受験')).toBeInTheDocument()
  })

  it('data-component / data-tone 属性が設定されている', () => {
    const { container } = render(<StatusPill tone="warning" label="保留" />)
    const el = container.querySelector('[data-component="status-pill"]')
    expect(el).toBeInTheDocument()
    expect(el?.getAttribute('data-tone')).toBe('warning')
  })

  it('showDot=false でドットを描画しない', () => {
    const { container } = render(<StatusPill tone="neutral" label="無効" showDot={false} />)
    const dot = container.querySelector('[aria-hidden="true"]')
    expect(dot).toBeNull()
  })
})
