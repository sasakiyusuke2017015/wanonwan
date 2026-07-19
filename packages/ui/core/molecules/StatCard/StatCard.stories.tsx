import { Icon } from '../../atoms/Icon'

import { StatCard } from './StatCard'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof StatCard> = {
  title: 'データ表示/StatCard',
  component: StatCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    unit: { control: 'text' },
    sub: { control: 'text' },
    className: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof StatCard>

/** 件数 + 補足 */
export const Default: Story = {
  args: {
    icon: <Icon name="file-badge" size={16} />,
    label: '認定試験',
    value: 12,
    unit: '件',
    sub: '登録済みの試験数',
  },
}

/** 単位・補足なしの最小構成 */
export const Minimal: Story = {
  args: {
    icon: <Icon name="users" size={16} />,
    label: '累計受験者',
    value: '1,234',
  },
}

/** 一覧ページ上部の 4 枚グリッド配置例 */
export const DashboardRow: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon={<Icon name="file-badge" size={16} />} label="認定試験" value={12} unit="件" sub="登録済みの試験数" />
      <StatCard icon={<Icon name="check-circle" size={16} />} label="公開中" value={8} unit="件" sub="ドラフト 4 件" />
      <StatCard icon={<Icon name="users" size={16} />} label="累計受験者" value="1,234" unit="名" sub="全試験の合計" />
      <StatCard icon={<Icon name="target" size={16} />} label="平均合格点" value={72} unit="%" sub="設定値の平均" />
    </div>
  ),
}
