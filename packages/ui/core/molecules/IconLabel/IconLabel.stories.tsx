import type { Meta, StoryObj } from '@storybook/react'
import { IconLabel } from './IconLabel'

const meta: Meta<typeof IconLabel> = {
  title: 'カレンダー/入力/IconLabel',
  component: IconLabel,
}

export default meta
type Story = StoryObj<typeof IconLabel>

export const Default: Story = {
  args: {
    icon: 'calendar',
    children: 'ミーティング',
  },
}

export const WithColor: Story = {
  args: {
    icon: 'bell',
    iconSize: 16,
    iconColor: '#6366F1',
    children: 'リマインダー',
  },
}

export const NoIcon: Story = {
  args: {
    children: 'アイコンなし',
  },
}

export const LargeIcon: Story = {
  args: {
    icon: 'users-group',
    iconSize: 24,
    children: 'チームミーティング',
  },
}
