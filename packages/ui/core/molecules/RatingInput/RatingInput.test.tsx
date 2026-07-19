import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RatingInput } from './RatingInput'

describe('RatingInput', () => {
  it('radiogroup として ★5 個を描画する', () => {
    render(<RatingInput value={0} onChange={() => {}} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('value の星が aria-checked になる', () => {
    render(<RatingInput value={3} onChange={() => {}} />)
    const radios = screen.getAllByRole('radio')
    expect(radios[2]).toHaveAttribute('aria-checked', 'true')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
  })

  it('★クリックで onChange がその値を返す', () => {
    const onChange = vi.fn()
    render(<RatingInput value={0} onChange={onChange} />)
    fireEvent.click(screen.getAllByRole('radio')[3]!)
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('ArrowRight で次の値、ArrowLeft で前の値', () => {
    const onChange = vi.fn()
    render(<RatingInput value={3} onChange={onChange} />)
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(4)
    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('端でクランプされる (5 で ArrowRight → 変化なし)', () => {
    const onChange = vi.fn()
    render(<RatingInput value={5} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disabled 中はクリックしても発火しない', () => {
    const onChange = vi.fn()
    render(<RatingInput value={0} onChange={onChange} disabled />)
    fireEvent.click(screen.getAllByRole('radio')[0]!)
    expect(onChange).not.toHaveBeenCalled()
  })
})
