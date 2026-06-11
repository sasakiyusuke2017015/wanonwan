import type { Meta, StoryObj } from '@storybook/react';

import { ChatFab } from './ChatFab';

const meta: Meta<typeof ChatFab> = {
  title: 'アクション/ChatFab',
  component: ChatFab,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatFab>;

export const Default: Story = {
  args: {},
};

export const WithMessages: Story = {
  args: {
    hasMessages: true,
  },
};

export const CustomIcon: Story = {
  args: {
    icon: '🤖',
    ariaLabel: 'AIアシスタントを開く',
  },
};
