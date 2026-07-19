import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('label と value が表示される', () => {
    render(<StatCard icon={<span />} label="認定試験" value={12} unit="件" sub="登録済みの試験数" />)
    expect(screen.getByText('認定試験')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('unit と sub が表示される', () => {
    render(<StatCard icon={<span />} label="累計受験者" value="1,234" unit="名" sub="全試験の合計" />)
    expect(screen.getByText('名')).toBeInTheDocument()
    expect(screen.getByText('全試験の合計')).toBeInTheDocument()
  })

  it('unit / sub 省略時は描画されない', () => {
    const { container } = render(<StatCard icon={<span />} label="コース" value={5} />)
    expect(container.querySelector('small')).not.toBeInTheDocument()
    expect(screen.queryByText('全試験の合計')).not.toBeInTheDocument()
  })

  it('icon が描画される', () => {
    render(<StatCard icon={<span data-testid="stat-icon" />} label="公開中" value={3} />)
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument()
  })

  it('className が root に適用される', () => {
    const { container } = render(
      <StatCard icon={<span />} label="公開中" value={3} className="custom" />,
    )
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
