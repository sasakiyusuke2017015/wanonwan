import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ViewModeToggle } from './ViewModeToggle'

const options = [
  { value: 'list', label: 'リスト', icon: 'list' as const },
  { value: 'grid', label: 'グリッド', icon: 'grid' as const },
]

describe('ViewModeToggle', () => {
  it('選択肢のラベルを表示する', () => {
    render(
      <ViewModeToggle
        value="list"
        options={options}
        onChange={() => {}}
        showLabel
      />
    )
    expect(screen.getByText('リスト')).toBeInTheDocument()
    expect(screen.getByText('グリッド')).toBeInTheDocument()
  })

  it('選択肢をクリックすると onChange が呼ばれる', () => {
    const onChange = vi.fn()
    render(
      <ViewModeToggle
        value="list"
        options={options}
        onChange={onChange}
        showLabel
      />
    )
    fireEvent.click(screen.getByText('グリッド'))
    expect(onChange).toHaveBeenCalledWith('grid')
  })
})
