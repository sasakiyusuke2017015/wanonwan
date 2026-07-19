import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('src が null のときは person アイコンを表示する', () => {
    const { container } = render(<Avatar src={null} name="山田 太郎" />)
    expect(container.querySelector('img')).toBe(null)
    expect(
      container.querySelector('[data-component="avatar"]')?.getAttribute('data-has-image'),
    ).toBe('false')
  })

  it('src がある場合は img を描画する', () => {
    const { container } = render(<Avatar src="http://example.com/me.png" name="山田 太郎" />)
    const img = container.querySelector('img')
    expect(img).not.toBe(null)
    expect(img?.getAttribute('src')).toBe('http://example.com/me.png')
    expect(img?.getAttribute('alt')).toBe('山田 太郎')
  })

  it('img の onError で person アイコンに fallback する', () => {
    const { container } = render(<Avatar src="http://example.com/broken.png" name="山田" />)
    const img = container.querySelector('img')
    expect(img).not.toBe(null)
    fireEvent.error(img!)
    expect(container.querySelector('img')).toBe(null)
    expect(
      container.querySelector('[data-component="avatar"]')?.getAttribute('data-has-image'),
    ).toBe('false')
  })

  it('size プロパティでサイズクラスが切り替わる', () => {
    const { container, rerender } = render(<Avatar src={null} name="山田" size="sm" />)
    expect(container.querySelector('[data-component="avatar"]')?.className).toContain('size-7')
    rerender(<Avatar src={null} name="山田" size="xl" />)
    expect(container.querySelector('[data-component="avatar"]')?.className).toContain('size-20')
  })
})
