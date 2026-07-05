import { describe, it, expect } from 'vitest'

import { computeAutoScrollSpeed } from './useDragAutoScroll'

// top=100, bottom=300 の縦長コンテナを想定。edgeSize=40 / maxSpeed=12。
const rect = { top: 100, bottom: 300 }
const opts = { edgeSize: 40, maxSpeed: 12 }

describe('computeAutoScrollSpeed', () => {
  it('中央付近ではスクロールしない (0 を返す)', () => {
    expect(computeAutoScrollSpeed(200, rect, opts)).toBe(0)
  })

  it('上端の edge 内では負 (上スクロール) を返す', () => {
    expect(computeAutoScrollSpeed(110, rect, opts)).toBeLessThan(0)
  })

  it('下端の edge 内では正 (下スクロール) を返す', () => {
    expect(computeAutoScrollSpeed(290, rect, opts)).toBeGreaterThan(0)
  })

  it('端に近いほど速度の絶対値が大きい', () => {
    const nearBottom = computeAutoScrollSpeed(299, rect, opts)
    const farInside = computeAutoScrollSpeed(265, rect, opts)
    expect(nearBottom).toBeGreaterThan(farInside)
  })

  it('最下端でも maxSpeed を超えない', () => {
    expect(computeAutoScrollSpeed(300, rect, opts)).toBeLessThanOrEqual(opts.maxSpeed)
  })

  it('最上端でも -maxSpeed を下回らない', () => {
    expect(computeAutoScrollSpeed(100, rect, opts)).toBeGreaterThanOrEqual(-opts.maxSpeed)
  })

  it('edge 境界 (edgeSize ちょうど) ではスクロールしない', () => {
    expect(computeAutoScrollSpeed(rect.top + opts.edgeSize, rect, opts)).toBe(0)
    expect(computeAutoScrollSpeed(rect.bottom - opts.edgeSize, rect, opts)).toBe(0)
  })
})
