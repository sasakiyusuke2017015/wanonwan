import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SelectableList } from './SelectableList'
import { Badge } from '../../atoms/Badge'

const meta: Meta<typeof SelectableList> = {
  title: 'データ表示/SelectableList',
  component: SelectableList,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

type Course = { id: number; title: string; level: string }

const COURSES: Course[] = [
  { id: 1, title: 'AIリテラシー入門', level: 'LV0' },
  { id: 2, title: '生成AI活用ガイド', level: 'LV1' },
  { id: 3, title: 'AIアプリ開発入門', level: 'LV2' },
]

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<Set<number>>(new Set([1]))
    return (
      <SelectableList<Course>
        items={COURSES}
        getKey={(c) => c.id}
        isSelected={(c) => selected.has(c.id)}
        onToggle={(c) =>
          setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(c.id)) {
              next.delete(c.id)
            } else {
              next.add(c.id)
            }
            return next
          })
        }
        renderPrimary={(c) => <span className="text-sm">{c.title}</span>}
        renderTrailing={(c) => <Badge value={c.level} size="small" />}
      />
    )
  },
}

export const Empty: Story = {
  render: () => (
    <SelectableList<Course>
      items={[]}
      getKey={(c) => c.id}
      isSelected={() => false}
      onToggle={() => {}}
      renderPrimary={(c) => <span>{c.title}</span>}
      emptyMessage="対象のコースがありません。"
    />
  ),
}
