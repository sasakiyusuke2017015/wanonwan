import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MathView, latexToPlain } from './MathView'

describe('MathView', () => {
  it('renders with data-component attribute in block mode', () => {
    const { container } = render(<MathView latex="x^2" />)
    expect(container.querySelector('[data-component="MathView"]')).toBeInTheDocument()
  })

  it('renders inline mode as a span without data-component', () => {
    const { container } = render(<MathView latex="x^2" inline />)
    const span = container.querySelector('span')
    expect(span).toBeInTheDocument()
    expect(container.querySelector('[data-component="MathView"]')).not.toBeInTheDocument()
  })

  it('applies custom fontSize and textColor styles', () => {
    const { container } = render(<MathView latex="E = mc^2" fontSize={24} textColor="red" />)
    const el = container.querySelector('[data-component="MathView"]')
    expect(el).toHaveStyle({ fontSize: '24px' })
    expect(el).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('converts fractions via latexToPlain', () => {
    const result = latexToPlain('\\frac{a}{b}')
    expect(result).toBe('(a/b)')
  })

  it('converts sqrt and operators via latexToPlain', () => {
    expect(latexToPlain('\\sqrt{x}')).toBe('√(x)')
    expect(latexToPlain('a \\cdot b')).toBe('a × b')
    expect(latexToPlain('x^2')).toContain('²')
  })
})
