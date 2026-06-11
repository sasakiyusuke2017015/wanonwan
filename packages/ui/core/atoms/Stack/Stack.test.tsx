import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stack } from './Stack'

describe('Stack', () => {
  it('子要素を表示する', () => {
    render(<Stack><span>A</span><span>B</span></Stack>)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('デフォルトで column 方向', () => {
    const { container } = render(<Stack>test</Stack>)
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('direction=row のクラスが適用される', () => {
    const { container } = render(<Stack direction="row">test</Stack>)
    expect(container.firstChild).toHaveClass('flex-row')
  })

  it('className が適用される', () => {
    const { container } = render(<Stack className="custom">test</Stack>)
    expect(container.firstChild).toHaveClass('custom')
  })
})
