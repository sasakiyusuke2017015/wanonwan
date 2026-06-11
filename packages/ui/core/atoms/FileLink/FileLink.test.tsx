import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileLink } from './FileLink'

describe('FileLink', () => {
  it('ファイル名を表示する', () => {
    render(<FileLink path="/src/Button.tsx" onOpen={() => {}} />)
    expect(screen.getByText('Button.tsx')).toBeInTheDocument()
  })

  it('label が指定された場合はそちらを表示する', () => {
    render(<FileLink path="/src/Button.tsx" label="ボタン" onOpen={() => {}} />)
    expect(screen.getByText('ボタン')).toBeInTheDocument()
  })

  it('クリック時に onOpen が path を引数に呼ばれる', () => {
    const onOpen = vi.fn()
    render(<FileLink path="/src/Button.tsx" onOpen={onOpen} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onOpen).toHaveBeenCalledWith('/src/Button.tsx')
  })

  it('data-component 属性が設定されている', () => {
    const { container } = render(<FileLink path="/src/Button.tsx" onOpen={() => {}} />)
    expect(container.querySelector('[data-component="file-link"]')).toBeInTheDocument()
  })
})
