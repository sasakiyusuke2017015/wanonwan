import type { Meta, StoryObj } from '@storybook/react';

import { DataCountDisplay } from './DataCountDisplay';

const meta: Meta<typeof DataCountDisplay> = {
  title: 'データ表示/統計/DataCountDisplay',
  component: DataCountDisplay,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof DataCountDisplay>;

export const Default: Story = {
  args: {
    totalCount: 42,
  },
};

export const WithSelection: Story = {
  args: {
    totalCount: 100,
    selectedCount: 5,
  },
};

export const Loading: Story = {
  args: {
    totalCount: 0,
    loading: true,
  },
};
