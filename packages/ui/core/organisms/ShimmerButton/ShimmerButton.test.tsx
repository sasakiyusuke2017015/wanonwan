import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShimmerButton } from './ShimmerButton'

describe('ShimmerButton', () => {
  it('子要素を表示する', () => {
    render(<ShimmerButton>クリック</ShimmerButton>)
    expect(screen.getByText('クリック')).toBeInTheDocument()
  })

  it('ボタンとしてレンダリングされる', () => {
    render(<ShimmerButton>test</ShimmerButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('クリック時に onClick が呼ばれる', () => {
    const onClick = vi.fn()
    render(<ShimmerButton onClick={onClick}>クリック</ShimmerButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled のとき操作できない', () => {
    render(<ShimmerButton disabled>クリック</ShimmerButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
