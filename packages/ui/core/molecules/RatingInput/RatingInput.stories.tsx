import { useState } from 'react'

import { RatingInput } from './RatingInput'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof RatingInput> = {
  title: 'フォーム/RatingInput',
  component: RatingInput,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 5 } },
    size: { control: { type: 'number', min: 14, max: 48 } },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
}

export default meta
type Story = StoryObj<typeof RatingInput>

/** クリック / 矢印キーで評価を選ぶインタラクティブ例 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(0)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <RatingInput value={value} onChange={setValue} />
        <span style={{ fontSize: 14, color: '#64748b' }}>{value > 0 ? `★${value}` : '未選択'}</span>
      </div>
    )
  },
}

/** 選択済み */
export const Selected: Story = {
  args: { value: 4, onChange: () => {} },
}

/** disabled (送信中など) */
export const Disabled: Story = {
  args: { value: 3, disabled: true, onChange: () => {} },
}
