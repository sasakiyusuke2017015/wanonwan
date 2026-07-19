import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { RadioCard } from './RadioCard'

const meta: Meta<typeof RadioCard> = {
  title: 'フォーム/RadioCard',
  component: RadioCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof RadioCard>

export const Default: Story = {
  args: {
    name: 'plan',
    value: 'basic',
    checked: false,
    title: '基本プラン',
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
}

export const WithDescription: Story = {
  args: {
    name: 'plan',
    value: 'basic',
    checked: false,
    title: '基本プラン',
    description: '月額 1,000 円。10 GB のストレージとメールサポートが含まれます。',
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Checked: Story = {
  args: {
    name: 'plan',
    value: 'basic',
    checked: true,
    title: '基本プラン',
    description: '月額 1,000 円。10 GB のストレージとメールサポートが含まれます。',
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Disabled: Story = {
  args: {
    name: 'plan',
    value: 'basic',
    checked: false,
    title: '基本プラン',
    description: '現在ご利用いただけません',
    disabled: true,
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Group: Story = {
  render: () => {
    const InteractiveGroup = () => {
      const [selected, setSelected] = useState('split')
      const options = [
        {
          value: 'split',
          title: '簡易 (split)',
          description: '章ごとに分割された教材。章 + コンテンツ (教材 / 理解度チェック) を組み合わせる構成',
        },
        {
          value: 'bulk',
          title: '一括 (bulk)',
          description: '最初から最後まで 1 本でまとまった教材。章なしで、1 本の長い教材ファイル / 動画 / 本文を配信',
        },
      ]
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '420px' }}>
          {options.map((o) => (
            <RadioCard
              key={o.value}
              name="material_style"
              value={o.value}
              checked={selected === o.value}
              onChange={setSelected}
              title={o.title}
              description={o.description}
            />
          ))}
        </div>
      )
    }
    return <InteractiveGroup />
  },
}
