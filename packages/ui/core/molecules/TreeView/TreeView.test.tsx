import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TreeView, type TreeNode } from './TreeView'

const nodes: TreeNode[] = [
  {
    id: '1',
    label: 'src',
    children: [
      { id: '2', label: 'Button.tsx', children: [] },
    ],
  },
  { id: '3', label: 'README.md', children: [] },
]

describe('TreeView', () => {
  it('ルートノードを表示する', () => {
    render(
      <TreeView
        nodes={nodes}
        expandedIds={new Set()}
        selectedId={null}
        onToggle={() => {}}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getByText('README.md')).toBeInTheDocument()
  })

  it('展開されたノードの子を表示する', () => {
    render(
      <TreeView
        nodes={nodes}
        expandedIds={new Set(['1'])}
        selectedId={null}
        onToggle={() => {}}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText('Button.tsx')).toBeInTheDocument()
  })

  it('折りたたまれたノードの子を表示しない', () => {
    render(
      <TreeView
        nodes={nodes}
        expandedIds={new Set()}
        selectedId={null}
        onToggle={() => {}}
        onSelect={() => {}}
      />
    )
    expect(screen.queryByText('Button.tsx')).toBeNull()
  })

  it('ノードクリックで onSelect が呼ばれる', () => {
    const onSelect = vi.fn()
    render(
      <TreeView
        nodes={nodes}
        expandedIds={new Set(['1'])}
        selectedId={null}
        onToggle={() => {}}
        onSelect={onSelect}
      />
    )
    fireEvent.click(screen.getByText('Button.tsx'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }))
  })
})
