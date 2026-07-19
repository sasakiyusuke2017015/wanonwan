// @vitest-environment jsdom
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Confetti } from './Confetti'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

function setReducedMotion(enabled: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') && enabled,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('Confetti', () => {
  it('renders particles when prefers-reduced-motion is OFF', () => {
    setReducedMotion(false)
    const { container } = render(<Confetti />)
    act(() => {
      // useEffect after mount sets particles state
    })
    const particles = container.querySelectorAll('span')
    expect(particles.length).toBeGreaterThan(0)
    vi.unstubAllGlobals()
  })

  it('honors particleCount prop', () => {
    setReducedMotion(false)
    const { container } = render(<Confetti particleCount={12} />)
    expect(container.querySelectorAll('span')).toHaveLength(12)
    vi.unstubAllGlobals()
  })

  it('renders nothing when prefers-reduced-motion: reduce', () => {
    setReducedMotion(true)
    const { container } = render(<Confetti />)
    expect(container.firstChild).toBeNull()
    vi.unstubAllGlobals()
  })

  it('auto-removes particles after durationMs', () => {
    setReducedMotion(false)
    const { container } = render(<Confetti durationMs={4_000} />)
    expect(container.querySelector('div')).not.toBeNull() // overlay mounted
    act(() => {
      vi.advanceTimersByTime(4_000)
    })
    // After durationMs, the overlay <div> is removed (setVisible(false))
    expect(container.firstChild).toBeNull()
    vi.unstubAllGlobals()
  })
})
