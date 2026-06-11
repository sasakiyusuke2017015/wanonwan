import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconPicker } from './IconPicker'

const meta: Meta<typeof IconPicker> = {
  title: 'カレンダー/入力/IconPicker',
  component: IconPicker,
}

export default meta
type Story = StoryObj<typeof IconPicker>

function Interactive() {
  const [value, setValue] = useState<string | undefined>('calendar')
  return (
    <div>
      <IconPicker value={value} onChange={setValue} />
      <p className="mt-4 text-sm text-text-secondary">選択中: {value ?? 'なし'}</p>
    </div>
  )
}

export const Default: Story = {
  render: () => <Interactive />,
}

export const NoSelection: Story = {
  args: {
    value: undefined,
    onChange: () => {},
  },
}

export const LargeSize: Story = {
  args: {
    value: 'bell',
    onChange: () => {},
    size: 40,
  },
}
