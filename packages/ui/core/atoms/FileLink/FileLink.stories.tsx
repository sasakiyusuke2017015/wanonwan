import type { Meta, StoryObj } from '@storybook/react'
import { FileLink } from './FileLink'

const meta: Meta<typeof FileLink> = {
  title: 'ナビゲーション/リンク/FileLink',
  component: FileLink,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    path: { control: 'text' },
    label: { control: 'text' },
    onOpen: { action: 'opened' },
  },
}

export default meta
type Story = StoryObj<typeof FileLink>

export const Default: Story = {
  args: {
    path: '/src/components/Button.tsx',
    onOpen: (path) => console.log('open', path),
  },
}

export const WithLabel: Story = {
  args: {
    path: '/src/components/Button.tsx',
    label: 'Button コンポーネント',
    onOpen: (path) => console.log('open', path),
  },
}

export const NestedPath: Story = {
  args: {
    path: '/workspaces/ui-catalog/core/molecules/Button/Button.tsx',
    onOpen: (path) => console.log('open', path),
  },
}
