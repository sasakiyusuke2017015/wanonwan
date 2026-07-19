import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectableList } from './SelectableList'

type Item = { id: number; name: string }

const items: Item[] = [
  { id: 1, name: '受講者' },
  { id: 2, name: '管理者' },
]

describe('SelectableList', () => {
  it('各行の主要表示を描画する', () => {
    render(
      <SelectableList
        items={items}
        getKey={(i) => i.id}
        isSelected={() => false}
        onToggle={() => {}}
        renderPrimary={(i) => <span>{i.name}</span>}
      />,
    )
    expect(screen.getByText('受講者')).toBeInTheDocument()
    expect(screen.getByText('管理者')).toBeInTheDocument()
  })

  it('チェック変更で onToggle が該当 item で呼ばれる', () => {
    const onToggle = vi.fn()
    render(
      <SelectableList
        items={items}
        getKey={(i) => i.id}
        isSelected={() => false}
        onToggle={onToggle}
        renderPrimary={(i) => <span>{i.name}</span>}
      />,
    )
    fireEvent.click(screen.getAllByRole('checkbox')[1])
    expect(onToggle).toHaveBeenCalledWith(items[1])
  })

  it('選択中の行に bg-blue-50 が付く', () => {
    const { container } = render(
      <SelectableList
        items={items}
        getKey={(i) => i.id}
        isSelected={(i) => i.id === 1}
        onToggle={() => {}}
        renderPrimary={(i) => <span>{i.name}</span>}
      />,
    )
    const selectedRow = container.querySelector('[data-selected="true"]')
    expect(selectedRow?.className).toContain('bg-blue-50')
  })

  it('disabled な行のチェックボックスは無効', () => {
    render(
      <SelectableList
        items={items}
        getKey={(i) => i.id}
        isSelected={() => false}
        onToggle={() => {}}
        isDisabled={(i) => i.id === 1}
        renderPrimary={(i) => <span>{i.name}</span>}
      />,
    )
    expect(screen.getAllByRole('checkbox')[0]).toBeDisabled()
  })

  it('items が空のとき emptyMessage を表示する', () => {
    render(
      <SelectableList
        items={[]}
        getKey={(i: Item) => i.id}
        isSelected={() => false}
        onToggle={() => {}}
        renderPrimary={(i: Item) => <span>{i.name}</span>}
        emptyMessage="対象の試験がありません。"
      />,
    )
    expect(screen.getByText('対象の試験がありません。')).toBeInTheDocument()
  })
})
