import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TransferList } from './TransferList'

const leftItems = [
  { id: '1', label: 'Item A' },
  { id: '2', label: 'Item B' },
]

const rightItems = [
  { id: '3', label: 'Item C' },
]

describe('TransferList', () => {
  it('renders left and right labels and item counts', () => {
    render(
      <TransferList
        leftItems={leftItems}
        rightItems={rightItems}
        leftLabel="有効"
        rightLabel="無効"
        onChange={() => {}}
      />
    )
    expect(screen.getByText('有効')).toBeInTheDocument()
    expect(screen.getByText('無効')).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('renders all item labels', () => {
    render(
      <TransferList
        leftItems={leftItems}
        rightItems={rightItems}
        leftLabel="左"
        rightLabel="右"
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
    expect(screen.getByText('Item C')).toBeInTheDocument()
  })

  it('shows empty message when a list has no items', () => {
    render(
      <TransferList
        leftItems={[]}
        rightItems={[]}
        leftLabel="左"
        rightLabel="右"
        onChange={() => {}}
      />
    )
    const emptyMessages = screen.getAllByText('アイテムがありません')
    expect(emptyMessages).toHaveLength(2)
  })

  it('moves selected item from left to right on button click', () => {
    const handleChange = vi.fn()
    render(
      <TransferList
        leftItems={leftItems}
        rightItems={rightItems}
        leftLabel="左"
        rightLabel="右"
        onChange={handleChange}
      />
    )

    // Click on Item A to select it
    fireEvent.click(screen.getByText('Item A'))

    // Click the move-to-right button
    fireEvent.click(screen.getByText('→'))

    expect(handleChange).toHaveBeenCalledWith(
      [{ id: '2', label: 'Item B' }],
      [{ id: '3', label: 'Item C' }, { id: '1', label: 'Item A' }]
    )
  })

  it('renders subLabel when provided', () => {
    const items = [{ id: '1', label: 'Main', subLabel: 'Sub text' }]
    render(
      <TransferList
        leftItems={items}
        rightItems={[]}
        leftLabel="左"
        rightLabel="右"
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Sub text')).toBeInTheDocument()
  })
})
