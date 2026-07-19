import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StickyFormFooter } from './StickyFormFooter'

describe('StickyFormFooter', () => {
  it('children（アクション）を表示する', () => {
    render(
      <StickyFormFooter>
        <button>保存</button>
      </StickyFormFooter>,
    )
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
  })

  it('status を表示する', () => {
    render(
      <StickyFormFooter status="すべての変更は保存済みです">
        <button>保存</button>
      </StickyFormFooter>,
    )
    expect(screen.getByText('すべての変更は保存済みです')).toBeInTheDocument()
  })

  it('status 未指定でもアクションのみ描画する', () => {
    const { container } = render(
      <StickyFormFooter>
        <button>保存</button>
      </StickyFormFooter>,
    )
    expect(container.querySelector('[data-component="sticky-form-footer"]')).toBeInTheDocument()
  })
})
