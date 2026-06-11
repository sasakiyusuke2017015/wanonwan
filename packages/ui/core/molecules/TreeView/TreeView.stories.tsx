import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TreeView } from './TreeView'
import type { TreeNode } from './TreeView'

const meta: Meta<typeof TreeView> = {
  title: 'データ表示/その他/TreeView',
  component: TreeView,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TreeView>

const sampleNodes: TreeNode[] = [
  {
    id: '1',
    label: 'src',
    children: [
      {
        id: '2',
        label: 'components',
        children: [
          { id: '3', label: 'Button.tsx', children: [] },
          { id: '4', label: 'Input.tsx', children: [] },
        ],
      },
      { id: '5', label: 'App.tsx', children: [] },
    ],
  },
  {
    id: '6',
    label: 'public',
    children: [{ id: '7', label: 'index.html', children: [] }],
  },
]

const TreeViewDemo = () => {
  const [expandedIds, setExpandedIds] = useState(new Set<string | number>(['1']))
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  return (
    <div style={{ width: 240, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <TreeView
        nodes={sampleNodes}
        expandedIds={expandedIds}
        selectedId={selectedId}
        onToggle={(id) =>
          setExpandedIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
          })
        }
        onSelect={(node) => setSelectedId(node.id)}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <TreeViewDemo />,
}

const deepNodes: TreeNode[] = [
  {
    id: 'root',
    label: 'プロジェクト',
    children: [
      {
        id: 'fe',
        label: 'フロントエンド',
        color: '#3B82F6',
        children: [
          {
            id: 'fe-comp',
            label: 'components',
            children: [
              { id: 'fe-btn', label: 'Button.tsx', children: [] },
              { id: 'fe-input', label: 'Input.tsx', children: [] },
              { id: 'fe-modal', label: 'Modal.tsx', children: [] },
            ],
          },
          {
            id: 'fe-hooks',
            label: 'hooks',
            children: [
              { id: 'fe-h1', label: 'useAuth.ts', children: [] },
              { id: 'fe-h2', label: 'useFetch.ts', children: [] },
            ],
          },
        ],
      },
      {
        id: 'be',
        label: 'バックエンド',
        color: '#10B981',
        children: [
          {
            id: 'be-api',
            label: 'api',
            children: [
              { id: 'be-a1', label: 'users.ts', children: [] },
              { id: 'be-a2', label: 'posts.ts', children: [] },
            ],
          },
        ],
      },
      {
        id: 'docs',
        label: 'ドキュメント',
        color: '#F59E0B',
        children: [
          { id: 'doc-readme', label: 'README.md', children: [] },
          { id: 'doc-api', label: 'API.md', children: [] },
        ],
      },
    ],
  },
]

const DeepTreeDemo = () => {
  const [expandedIds, setExpandedIds] = useState(
    new Set<string | number>(['root', 'fe', 'fe-comp', 'be', 'docs']),
  )
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  return (
    <div style={{ width: 280, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <TreeView
        nodes={deepNodes}
        expandedIds={expandedIds}
        selectedId={selectedId}
        onToggle={(id) =>
          setExpandedIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
          })
        }
        onSelect={(node) => setSelectedId(node.id)}
      />
    </div>
  )
}

export const DeepNested: Story = {
  render: () => <DeepTreeDemo />,
}

const WithGuidesDemo = () => {
  const [expandedIds, setExpandedIds] = useState(
    new Set<string | number>(['root', 'fe', 'fe-comp', 'be']),
  )
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  return (
    <div style={{ width: 300, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <TreeView
        nodes={deepNodes}
        expandedIds={expandedIds}
        selectedId={selectedId}
        showGuides
        onToggle={(id) =>
          setExpandedIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
          })
        }
        onSelect={(node) => setSelectedId(node.id)}
      />
    </div>
  )
}

export const WithGuides: Story = {
  render: () => <WithGuidesDemo />,
}

const singleLeafNodes: TreeNode[] = [
  { id: '1', label: 'ファイル A.txt', children: [] },
  { id: '2', label: 'ファイル B.txt', children: [] },
  { id: '3', label: 'ファイル C.txt', children: [] },
]

const FlatListDemo = () => {
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  return (
    <div style={{ width: 240, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <TreeView
        nodes={singleLeafNodes}
        expandedIds={new Set()}
        selectedId={selectedId}
        onToggle={() => {}}
        onSelect={(node) => setSelectedId(node.id)}
      />
    </div>
  )
}

export const FlatList: Story = {
  render: () => <FlatListDemo />,
}
