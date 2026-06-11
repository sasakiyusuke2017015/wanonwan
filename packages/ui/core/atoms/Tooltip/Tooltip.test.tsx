import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('子要素を表示する', () => {
    render(<Tooltip content="ヒント"><button>ボタン</button></Tooltip>)
    expect(screen.getByText('ボタン')).toBeInTheDocument()
  })

  it('tooltip テキストが DOM に存在する', () => {
    render(<Tooltip content="ヒントテキスト"><span>hover me</span></Tooltip>)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('ヒントテキスト')).toBeInTheDocument()
  })

  it('data-component 属性が設定されている', () => {
    const { container } = render(<Tooltip content="test"><span>x</span></Tooltip>)
    expect(container.querySelector('[data-component="tooltip"]')).toBeInTheDocument()
  })
})
