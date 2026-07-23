import type { Meta, StoryObj } from '@storybook/react'
import { SectionHeading } from './SectionHeading'

type Story = StoryObj<typeof SectionHeading>

/**
 * セクション見出し + 件数バッジ / カード番号。
 * 管理画面のフォーム/一覧のセクション区切りに使う。複数カードの長いフォーム
 * (コース / 認定試験の新規・編集) は number + subtitle の番号付きカード見出しにする。
 */
const meta: Meta<typeof SectionHeading> = {
  title: 'ナビゲーション/SectionHeading',
  component: SectionHeading,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    title: { description: '見出しテキスト', control: { type: 'text' } },
    number: { description: 'カード通し番号（指定時のみ表示）', control: { type: 'number' } },
    subtitle: { description: 'タイトル下の補足説明', control: { type: 'text' } },
    count: { description: '件数バッジ（指定時のみ表示）', control: { type: 'number' } },
    note: { description: '右端の補足ピル（例: 任意項目含む）', control: { type: 'text' } },
  },
}

export default meta

export const Default: Story = {
  args: { title: '基本情報' },
}

export const WithCount: Story = {
  args: { title: '受講可能コース', count: 3 },
}

export const NumberedCard: Story = {
  args: {
    number: 1,
    title: '基本情報',
    subtitle: 'コースの顔になる項目とレベル・カテゴリなどの分類',
    note: '任意項目含む',
  },
}

export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <SectionHeading title="基本情報" />
      <SectionHeading title="受講可能コース" count={5} />
      <SectionHeading title="受験可能認定試験" count={2} />
      <SectionHeading number={1} title="基本情報" subtitle="試験名と対象レベルを指定します" />
      <SectionHeading number={2} title="サムネイル" subtitle="一覧・受講画面での見え方" note="任意項目含む" />
    </div>
  ),
}
