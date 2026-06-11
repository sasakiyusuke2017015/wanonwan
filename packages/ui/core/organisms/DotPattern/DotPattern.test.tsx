import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DotPattern } from './DotPattern'

describe('DotPattern', () => {
  it('SVG をレンダリングする', () => {
    const { container } = render(<DotPattern />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('className が適用される', () => {
    const { container } = render(<DotPattern className="custom" />)
    expect(container.querySelector('svg')).toHaveClass('custom')
  })
})
