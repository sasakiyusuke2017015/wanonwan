import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('aria-label が設定される', () => {
    render(<IconButton icon="edit" label="編集" />)
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })

  it('data-component 属性が設定されている', () => {
    const { container } = render(<IconButton icon="edit" label="編集" />)
    expect(container.querySelector('[data-component="icon-button"]')).toBeInTheDocument()
  })

  it('disabled のとき操作できない', () => {
    render(<IconButton icon="edit" label="編集" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('クリック時に onClick が呼ばれる', () => {
    const onClick = vi.fn()
    render(<IconButton icon="edit" label="編集" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled のときクリックしても onClick が呼ばれない', () => {
    const onClick = vi.fn()
    render(<IconButton icon="edit" label="編集" disabled onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
