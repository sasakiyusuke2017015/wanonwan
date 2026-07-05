import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { Pagination, getPaginationRange } from './Pagination'

describe('getPaginationRange', () => {
  it('totalPages <= 1 のとき空配列を返す', () => {
    expect(getPaginationRange(1, 1, 1, 1)).toEqual([])
    expect(getPaginationRange(0, 1, 1, 1)).toEqual([])
  })

  it('totalPages が小さくて全部表示できるなら省略なし', () => {
    expect(getPaginationRange(5, 3, 1, 1)).toEqual([1, 2, 3, 4, 5])
  })

  it('currentPage が左端のとき左側は省略しない', () => {
    expect(getPaginationRange(10, 2, 1, 1)).toEqual([1, 2, 3, 4, '…', 10])
  })

  it('currentPage が右端のとき右側は省略しない', () => {
    expect(getPaginationRange(10, 9, 1, 1)).toEqual([1, '…', 7, 8, 9, 10])
  })

  it('currentPage が中央のとき両側省略', () => {
    expect(getPaginationRange(10, 6, 1, 1)).toEqual([1, '…', 5, 6, 7, '…', 10])
  })

  it('siblingCount=2 のとき現在ページの両側 2 個ずつ表示', () => {
    expect(getPaginationRange(20, 10, 2, 1)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20])
  })

  it('boundaryCount=2 のとき両端 2 個ずつ表示', () => {
    expect(getPaginationRange(20, 10, 1, 2)).toEqual([1, 2, '…', 9, 10, 11, '…', 19, 20])
  })
})

describe('Pagination', () => {
  it('totalPages <= 1 のとき何もレンダリングしない', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('番号ボタンが表示される', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /1 ページ目/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2 ページ目/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /3 ページ目/ })).toBeInTheDocument()
  })

  it('現在ページに aria-current="page" が付く', () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />)
    const current = screen.getByRole('button', { name: /2 ページ目/ })
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('現在ページ以外には aria-current が付かない', () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />)
    const other = screen.getByRole('button', { name: /1 ページ目/ })
    expect(other).not.toHaveAttribute('aria-current')
  })

  it('番号ボタンをクリックすると onPageChange が呼ばれる', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /3 ページ目/ }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    expect(onPageChange).toHaveBeenCalledTimes(1)
  })

  it('現在ページをクリックしても onPageChange は呼ばれない', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /2 ページ目/ }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('前へボタンが表示され、currentPage=1 のときは disabled', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />)
    const prev = screen.getByRole('button', { name: '前へ' })
    expect(prev).toBeDisabled()
  })

  it('次へボタンが表示され、currentPage=totalPages のときは disabled', () => {
    render(<Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />)
    const next = screen.getByRole('button', { name: '次へ' })
    expect(next).toBeDisabled()
  })

  it('前へボタンをクリックすると currentPage - 1 で onPageChange が呼ばれる', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '前へ' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('次へボタンをクリックすると currentPage + 1 で onPageChange が呼ばれる', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '次へ' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('省略記号 … は button ではなく span で表示される', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />)
    const ellipses = screen.getAllByText('…')
    expect(ellipses.length).toBeGreaterThan(0)
    for (const el of ellipses) {
      expect(el.tagName).toBe('SPAN')
    }
  })

  it('nav 要素に aria-label が付く', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'ページネーション' })).toBeInTheDocument()
  })

  it('className が適用される', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} className="custom" />,
    )
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })

  it('prevLabel / nextLabel をカスタマイズできる', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        onPageChange={vi.fn()}
        prevLabel="Previous"
        nextLabel="Next"
      />,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('currentPage / totalPages が不正値でもクラッシュしない', () => {
    expect(() =>
      render(<Pagination currentPage={0} totalPages={3} onPageChange={vi.fn()} />),
    ).not.toThrow()
    expect(() =>
      render(<Pagination currentPage={5} totalPages={3} onPageChange={vi.fn()} />),
    ).not.toThrow()
  })
})
