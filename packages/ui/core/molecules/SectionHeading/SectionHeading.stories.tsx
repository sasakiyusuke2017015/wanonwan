import type { Meta, StoryObj } from '@storybook/react'
import { SectionHeading } from './SectionHeading'

type Story = StoryObj<typeof SectionHeading>

/**
 * セクション見出し + 件数バッジ。
 * 管理画面のフォーム/一覧のセクション区切りに使う。
 */
const meta: Meta<typeof SectionHeading> = {
  title: 'ナビゲーション/SectionHeading',
  component: SectionHeading,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    title: { description: '見出しテキスト', control: { type: 'text' } },
    count: { description: '件数バッジ（指定時のみ表示）', control: { type: 'number' } },
  },
}

export default meta

export const Default: Story = {
  args: { title: '基本情報' },
}

export const WithCount: Story = {
  args: { title: '受講可能コース', count: 3 },
}

export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <SectionHeading title="基本情報" />
      <SectionHeading title="受講可能コース" count={5} />
      <SectionHeading title="受験可能認定試験" count={2} />
    </div>
  ),
}
