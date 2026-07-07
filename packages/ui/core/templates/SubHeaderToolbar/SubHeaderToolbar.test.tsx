import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import type { FilterDef } from '../../organisms/DataTable/types'

import { SubHeaderToolbar } from './SubHeaderToolbar'

const statusFilter = (value: string | null, onChange = vi.fn()): FilterDef => ({
  key: 'status',
  label: '状態',
  value,
  onChange,
  options: [
    { value: 'active', label: '有効' },
    { value: 'inactive', label: '無効' },
  ],
})

describe('SubHeaderToolbar', () => {
  it('title と data-component を描画する', () => {
    const { container } = render(<SubHeaderToolbar title="ユーザー管理" />)
    expect(container.querySelector('[data-component="sub-header-toolbar"]')).toBeInTheDocument()
    expect(screen.getByText('ユーザー管理')).toBeInTheDocument()
  })

  it('既定は閉状態で、funnel クリックで開閉する', () => {
    render(<SubHeaderToolbar search={{ value: '', onChange: vi.fn() }} />)
    const toggle = screen.getByRole('button', { name: 'フィルタを切り替える' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('defaultOpen=true で初期展開になり検索 box が見える', () => {
    render(<SubHeaderToolbar defaultOpen search={{ value: '', onChange: vi.fn() }} />)
    expect(screen.getByRole('button', { name: 'フィルタを切り替える' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByPlaceholderText('キーワードで検索')).toBeInTheDocument()
  })

  it('適用中フィルタは閉状態でもチップ要約され、× で解除できる', () => {
    const onChange = vi.fn()
    render(<SubHeaderToolbar filters={[statusFilter('active', onChange)]} />)
    expect(screen.getByText('状態: 有効')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '状態: 有効 を解除' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('onCreate / onReset で ＋ とリセットボタンが出る', () => {
    const onCreate = vi.fn()
    const onReset = vi.fn()
    render(<SubHeaderToolbar onCreate={onCreate} onReset={onReset} createLabel="ユーザーを追加" />)
    fireEvent.click(screen.getByRole('button', { name: 'ユーザーを追加' }))
    expect(onCreate).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'フィルタをリセット' }))
    expect(onReset).toHaveBeenCalled()
  })
})
