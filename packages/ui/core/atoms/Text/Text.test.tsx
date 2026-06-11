import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('テキストを表示する', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('デフォルトで span としてレンダリングされる', () => {
    const { container } = render(<Text>test</Text>)
    expect(container.firstChild?.nodeName).toBe('SPAN')
  })

  it('as prop で要素を切り替えられる', () => {
    const { container } = render(<Text as="p">test</Text>)
    expect(container.firstChild?.nodeName).toBe('P')
  })

  it('weight=bold のクラスが適用される', () => {
    const { container } = render(<Text weight="bold">test</Text>)
    expect(container.firstChild).toHaveClass('font-bold')
  })

  it('truncate のクラスが適用される', () => {
    const { container } = render(<Text truncate>test</Text>)
    expect(container.firstChild).toHaveClass('truncate')
  })
})
