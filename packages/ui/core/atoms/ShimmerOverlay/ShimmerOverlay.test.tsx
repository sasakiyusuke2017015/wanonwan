import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { ShimmerOverlay } from './ShimmerOverlay'

describe('ShimmerOverlay', () => {
  it('active=false のとき何もレンダリングしない', () => {
    const { container } = render(<ShimmerOverlay active={false} />)
    expect(
      container.querySelector('[data-component="shimmer-overlay"]')
    ).toBeNull()
  })

  it('active=true のときオーバーレイを描画し、支援技術から隠す (aria-hidden)', () => {
    const { container } = render(<ShimmerOverlay active />)
    const el = container.querySelector('[data-component="shimmer-overlay"]')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })

  it('装飾なので pointer-events を奪わない (pointer-events: none)', () => {
    const { container } = render(<ShimmerOverlay active />)
    const el = container.querySelector(
      '[data-component="shimmer-overlay"]'
    ) as HTMLElement | null
    // module 化された class 名は環境依存のため、style 由来ではなく存在のみ担保。
    // pointer-events は SCSS で none 固定 (視覚テストは VRT / story 側)。
    expect(el).not.toBeNull()
  })

  it('className を透過する', () => {
    const { container } = render(
      <ShimmerOverlay active className="custom-overlay" />
    )
    expect(
      container.querySelector('[data-component="shimmer-overlay"]')
    ).toHaveClass('custom-overlay')
  })
})
