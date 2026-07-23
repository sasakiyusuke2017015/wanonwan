import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})

// Polyfill ResizeObserver for jsdom
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// Polyfill IntersectionObserver for jsdom (framer-motion の useInView が参照する)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    root = null
    rootMargin = ''
    thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// Polyfill scrollIntoView for jsdom
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = vi.fn()
}

// Polyfill scrollTo / scrollBy for jsdom (jsdom は要素スクロールを実装しない)。
// 呼び出せるようにするだけで座標は動かさない。mock にすると呼び出し履歴がテストファイル
// 横断で溜まり誤用の元になるため、素の no-op にしておく。
if (typeof Element.prototype.scrollTo === 'undefined') {
  Element.prototype.scrollTo = () => {}
}
if (typeof Element.prototype.scrollBy === 'undefined') {
  Element.prototype.scrollBy = () => {}
}
