import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from './StatusBar'

describe('StatusBar', () => {
  it('メッセージを表示する', () => {
    render(<StatusBar message="保存しました" />)
    expect(screen.getByText('保存しました')).toBeInTheDocument()
  })

  it('message が空のとき何も表示しない', () => {
    const { container } = render(<StatusBar message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('data-component 属性が設定されている', () => {
    const { container } = render(<StatusBar message="test" />)
    expect(container.querySelector('[data-component="status-bar"]')).toBeInTheDocument()
  })

  it('variant=error のクラスが適用される', () => {
    const { container } = render(<StatusBar message="エラー" variant="error" />)
    const el = container.querySelector('[data-component="status-bar"]')
    expect(el?.className).toContain('text-(--color-error)')
  })

  it('variant=info のクラスが適用される', () => {
    const { container } = render(<StatusBar message="情報" variant="info" />)
    const el = container.querySelector('[data-component="status-bar"]')
    expect(el?.className).toContain('text-(--color-accent)')
  })
})
