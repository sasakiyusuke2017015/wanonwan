import type { Meta, StoryObj } from '@storybook/react'
import { StatusPill } from './StatusPill'

type Story = StoryObj<typeof StatusPill>

/**
 * ドット付きのステータス表示 pill。
 * アカウント状態（有効/無効）や受験状態などに使う。
 */
const meta: Meta<typeof StatusPill> = {
  title: '表示/コンテンツ/StatusPill',
  component: StatusPill,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      description: '配色トーン',
      control: { type: 'select' },
      options: ['success', 'info', 'neutral', 'warning', 'danger'],
    },
    label: { description: '表示ラベル', control: { type: 'text' } },
    showDot: { description: 'ステータスドットの表示', control: { type: 'boolean' } },
  },
}

export default meta

export const Default: Story = {
  args: { tone: 'success', label: '有効' },
}

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusPill tone="success" label="有効" />
      <StatusPill tone="info" label="未受験（受験可能）" />
      <StatusPill tone="neutral" label="無効" />
      <StatusPill tone="warning" label="保留" />
      <StatusPill tone="danger" label="停止" />
    </div>
  ),
}
