import type { Meta, StoryObj } from '@storybook/react';

import { RefreshButton } from './RefreshButton';

const meta: Meta<typeof RefreshButton> = {
  title: 'アクション/RefreshButton',
  component: RefreshButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    onRefresh: { action: 'refreshed' },
  },
};

export default meta;
type Story = StoryObj<typeof RefreshButton>;

export const Default: Story = {
  args: {
    dataUpdatedAt: Date.now(),
  },
};

export const Loading: Story = {
  args: {
    dataUpdatedAt: Date.now(),
    loading: true,
  },
};

export const Refreshing: Story = {
  args: {
    dataUpdatedAt: Date.now(),
    refreshing: true,
  },
};

export const NoData: Story = {
  args: {
    dataUpdatedAt: 0,
  },
};
