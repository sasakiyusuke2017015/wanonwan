// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Collapse } from './Collapse'

describe('Collapse', () => {
  it('open の真偽に依らず children を常に DOM に残す (高さのみアニメーション)', () => {
    const { rerender } = render(
      <Collapse open={false}>
        <p>中身</p>
      </Collapse>,
    )
    // 閉じていても DOM から消さない (grid で高さを畳むだけ)
    expect(screen.getByText('中身')).toBeInTheDocument()

    rerender(
      <Collapse open>
        <p>中身</p>
      </Collapse>,
    )
    expect(screen.getByText('中身')).toBeInTheDocument()
  })

  it('open を data-open 属性に反映する', () => {
    const { rerender, container } = render(
      <Collapse open={false}>
        <p>x</p>
      </Collapse>,
    )
    const root = container.querySelector('[data-component="collapse"]')
    expect(root).toHaveAttribute('data-open', 'false')

    rerender(
      <Collapse open>
        <p>x</p>
      </Collapse>,
    )
    expect(root).toHaveAttribute('data-open', 'true')
  })

  it('id を root に素通しする (trigger の aria-controls 用)', () => {
    const { container } = render(
      <Collapse open id="filters-region">
        <p>x</p>
      </Collapse>,
    )
    const root = container.querySelector('[data-component="collapse"]')
    expect(root).toHaveAttribute('id', 'filters-region')
  })

  it('durationMs を CSS 変数 --collapse-duration に反映する', () => {
    const { container } = render(
      <Collapse open durationMs={500}>
        <p>x</p>
      </Collapse>,
    )
    const root = container.querySelector<HTMLElement>('[data-component="collapse"]')
    expect(root?.style.getPropertyValue('--collapse-duration')).toBe('500ms')
  })

  it('className を root に合成する', () => {
    const { container } = render(
      <Collapse open className="extra">
        <p>x</p>
      </Collapse>,
    )
    const root = container.querySelector('[data-component="collapse"]')
    expect(root).toHaveClass('extra')
  })
})
