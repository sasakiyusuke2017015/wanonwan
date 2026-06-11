import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Box } from './Box'

describe('Box', () => {
  it('子要素を表示する', () => {
    render(<Box>コンテンツ</Box>)
    expect(screen.getByText('コンテンツ')).toBeInTheDocument()
  })

  it('デフォルトで div としてレンダリングされる', () => {
    const { container } = render(<Box>test</Box>)
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('as prop で要素を切り替えられる', () => {
    const { container } = render(<Box as="section">test</Box>)
    expect(container.firstChild?.nodeName).toBe('SECTION')
  })

  it('className が適用される', () => {
    const { container } = render(<Box className="custom">test</Box>)
    expect(container.firstChild).toHaveClass('custom')
  })
})
