import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeading } from './SectionHeading'

describe('SectionHeading', () => {
  it('タイトルを表示する', () => {
    render(<SectionHeading title="基本情報" />)
    expect(screen.getByRole('heading', { name: '基本情報' })).toBeInTheDocument()
  })

  it('count を指定すると件数バッジを表示する', () => {
    const { container } = render(<SectionHeading title="受講可能コース" count={3} />)
    expect(
      container.querySelector('[data-component="section-heading-count"]')?.textContent,
    ).toBe('3')
  })

  it('count=0 でもバッジを表示する', () => {
    const { container } = render(<SectionHeading title="試験" count={0} />)
    expect(
      container.querySelector('[data-component="section-heading-count"]')?.textContent,
    ).toBe('0')
  })

  it('count 未指定のときバッジを表示しない', () => {
    const { container } = render(<SectionHeading title="基本情報" />)
    expect(container.querySelector('[data-component="section-heading-count"]')).toBeNull()
  })

  it('trailing を表示する', () => {
    render(<SectionHeading title="基本情報" trailing={<button>編集</button>} />)
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })

  it('number を指定すると番号チップを表示する', () => {
    const { container } = render(<SectionHeading number={1} title="基本情報" />)
    expect(
      container.querySelector('[data-component="section-heading-number"]')?.textContent,
    ).toBe('1')
  })

  it('number 未指定のとき番号チップを表示しない', () => {
    const { container } = render(<SectionHeading title="基本情報" />)
    expect(container.querySelector('[data-component="section-heading-number"]')).toBeNull()
  })

  it('subtitle をタイトル下に表示する', () => {
    render(<SectionHeading number={1} title="基本情報" subtitle="コースの顔になる項目" />)
    expect(screen.getByText('コースの顔になる項目')).toBeInTheDocument()
  })

  it('note を右端の補足ピルとして表示する', () => {
    const { container } = render(
      <SectionHeading number={1} title="基本情報" note="任意項目含む" />,
    )
    expect(
      container.querySelector('[data-component="section-heading-note"]')?.textContent,
    ).toBe('任意項目含む')
  })
})
