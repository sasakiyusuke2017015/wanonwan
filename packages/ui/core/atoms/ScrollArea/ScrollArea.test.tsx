import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { ScrollArea } from './ScrollArea'

describe('ScrollArea', () => {
  it('子要素を表示する', () => {
    render(<ScrollArea>中身</ScrollArea>)
    expect(screen.getByText('中身')).toBeInTheDocument()
  })

  it('既定では div + 縦スクロール + fill クラスを付ける', () => {
    const { container } = render(<ScrollArea>x</ScrollArea>)
    const el = container.querySelector('[data-component="scroll-area"]') as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveClass('overflow-y-auto', 'overflow-x-hidden', 'flex-1', 'min-h-0', 'min-w-0')
  })

  it('axis="horizontal" で横スクロールクラスを付ける', () => {
    const { container } = render(<ScrollArea axis="horizontal">x</ScrollArea>)
    const el = container.querySelector('[data-component="scroll-area"]') as HTMLElement
    expect(el).toHaveClass('overflow-x-auto', 'overflow-y-hidden')
    expect(el).not.toHaveClass('overflow-y-auto')
  })

  it('axis="both" で両方向スクロールクラスを付ける', () => {
    const { container } = render(<ScrollArea axis="both">x</ScrollArea>)
    const el = container.querySelector('[data-component="scroll-area"]') as HTMLElement
    expect(el).toHaveClass('overflow-auto')
  })

  it('fill={false} のとき fill クラスを付けない', () => {
    const { container } = render(<ScrollArea fill={false}>x</ScrollArea>)
    const el = container.querySelector('[data-component="scroll-area"]') as HTMLElement
    expect(el).not.toHaveClass('flex-1')
    expect(el).not.toHaveClass('min-h-0')
  })

  it('as で要素を差し替えられる (nav ランドマーク)', () => {
    const { container } = render(
      <ScrollArea as="nav" aria-label="メインナビ">
        x
      </ScrollArea>,
    )
    const el = container.querySelector('[data-component="scroll-area"]') as HTMLElement
    expect(el.tagName).toBe('NAV')
    expect(el).toHaveAttribute('aria-label', 'メインナビ')
  })

  it('既定は data-scrollbar="auto"、scrollbar="thin" で thin になる', () => {
    const { container, rerender } = render(<ScrollArea>x</ScrollArea>)
    expect(container.querySelector('[data-component="scroll-area"]')).toHaveAttribute(
      'data-scrollbar',
      'auto',
    )
    rerender(<ScrollArea scrollbar="thin">x</ScrollArea>)
    expect(container.querySelector('[data-component="scroll-area"]')).toHaveAttribute(
      'data-scrollbar',
      'thin',
    )
  })

  it('className と任意の HTML 属性を透過する', () => {
    const { container } = render(
      <ScrollArea className="custom" id="pane">
        x
      </ScrollArea>,
    )
    const el = container.querySelector('[data-component="scroll-area"]') as HTMLElement
    expect(el).toHaveClass('custom')
    expect(el).toHaveAttribute('id', 'pane')
  })
})
