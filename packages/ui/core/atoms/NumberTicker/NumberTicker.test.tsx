import { describe, it, expect, beforeAll } from 'vitest'
import { render } from '@testing-library/react'
import { NumberTicker } from './NumberTicker'

beforeAll(() => {
  // framer-motion の useInView が依存する IntersectionObserver を jsdom 環境で stub
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
})

describe('NumberTicker', () => {
  it('レンダリングされる', () => {
    const { container } = render(<NumberTicker value={100} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('className が適用される', () => {
    const { container } = render(<NumberTicker value={42} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
