import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GridPattern } from './GridPattern'

describe('GridPattern', () => {
  it('SVG をレンダリングする', () => {
    const { container } = render(<GridPattern />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('className が適用される', () => {
    const { container } = render(<GridPattern className="custom" />)
    expect(container.querySelector('svg')).toHaveClass('custom')
  })
})
