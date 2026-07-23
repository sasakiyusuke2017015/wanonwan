// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SegmentedRatioBar } from './SegmentedRatioBar'

const segments = [
  { key: 1, label: 'AI基礎', value: 50, color: '#2563eb' },
  { key: 2, label: 'プロンプト', value: 30, color: null },
  { key: 3, label: 'リスク', value: 20 },
]

describe('SegmentedRatioBar', () => {
  it('正規化した % を aria-label / title で提示する', () => {
    render(<SegmentedRatioBar segments={segments} />)
    const bar = screen.getByRole('img')
    expect(bar).toHaveAttribute('aria-label', 'AI基礎 50% / プロンプト 30% / リスク 20%')
    expect(screen.getByTitle('AI基礎 50%')).toBeInTheDocument()
  })

  it('合計 100 でない重みも実合計で正規化する', () => {
    render(
      <SegmentedRatioBar
        segments={[
          { key: 1, label: 'A', value: 3 },
          { key: 2, label: 'B', value: 1 },
        ]}
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'A 75% / B 25%')
  })

  it('指定色を使い、未指定はフォールバックパレットで塗る', () => {
    render(<SegmentedRatioBar segments={segments} />)
    expect(screen.getByTitle('AI基礎 50%')).toHaveStyle({ backgroundColor: '#2563eb' })
    // color: null / 未指定はパレット色 (透明にならない)
    expect(screen.getByTitle('プロンプト 30%').style.backgroundColor).not.toBe('')
    expect(screen.getByTitle('リスク 20%').style.backgroundColor).not.toBe('')
  })

  it('重み 0 のセグメントは描画しない', () => {
    render(
      <SegmentedRatioBar
        segments={[
          { key: 1, label: 'A', value: 100 },
          { key: 2, label: 'B', value: 0 },
        ]}
      />,
    )
    expect(screen.queryByTitle(/^B /)).not.toBeInTheDocument()
  })

  it('正の重みが 1 つも無ければ何も描画しない', () => {
    const { container } = render(<SegmentedRatioBar segments={[{ key: 1, label: 'A', value: 0 }]} />)
    expect(container.firstChild).toBeNull()
  })
})
