import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiffViewer } from './DiffViewer'

const defaultProps = {
  isOpen: true,
  entries: [
    { path: 'name', kind: 'changed', old: '旧値', new: '新値' },
    { path: 'status', kind: 'added', new: 'active' },
    { path: 'oldField', kind: 'removed', old: '削除フィールド' },
  ],
  summary: { added: 1, removed: 1, changed: 1, total: 3 },
  leftLabel: '変更前',
  rightLabel: '変更後',
  onClose: vi.fn(),
}

describe('DiffViewer', () => {
  it('isOpen=false のとき何も表示しない', () => {
    const { container } = render(<DiffViewer {...defaultProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('エントリのパスを表示する', () => {
    render(<DiffViewer {...defaultProps} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('status')).toBeInTheDocument()
  })

  it('changed エントリで旧値と新値を表示する', () => {
    render(<DiffViewer {...defaultProps} />)
    expect(screen.getByText('旧値')).toBeInTheDocument()
    expect(screen.getByText('新値')).toBeInTheDocument()
  })

  it('閉じるボタンで onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<DiffViewer {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /×/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
