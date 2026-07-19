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

  it('position が data-position に反映される (既定は bottom)', () => {
    render(<Tooltip content="test"><span>x</span></Tooltip>)
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'bottom')
  })

  it('端揃えの top-end / bottom-end / top-start / bottom-start を受け付ける', () => {
    const { rerender } = render(
      <Tooltip content="test" position="top-end"><span>x</span></Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'top-end')
    rerender(<Tooltip content="test" position="bottom-end"><span>x</span></Tooltip>)
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'bottom-end')
    rerender(<Tooltip content="test" position="top-start"><span>x</span></Tooltip>)
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'top-start')
    rerender(<Tooltip content="test" position="bottom-start"><span>x</span></Tooltip>)
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'bottom-start')
  })
})
