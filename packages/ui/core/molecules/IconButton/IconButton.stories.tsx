import type { Meta, StoryObj } from '@storybook/react'
import { IconButton } from './IconButton'

const meta: Meta<typeof IconButton> = {
  title: '入力/ボタン/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    size: { control: 'number' },
    label: { control: 'text' },
    variant: { control: 'select', options: ['default', 'danger'] },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

export const Default: Story = {
  args: {
    icon: 'edit',
    label: '編集',
  },
}

export const Danger: Story = {
  args: {
    icon: 'trash',
    label: '削除',
    variant: 'danger',
  },
}

export const Disabled: Story = {
  args: {
    icon: 'edit',
    label: '編集（無効）',
    disabled: true,
  },
}

export const LargeSize: Story = {
  args: {
    icon: 'settings',
    label: '設定',
    size: 20,
  },
}
