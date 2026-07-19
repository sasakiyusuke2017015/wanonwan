import type { Meta, StoryObj } from '@storybook/react';

import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'フィードバック/通知/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'データがありません',
    description: '新しいアイテムを追加してください。',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <span style={{ fontSize: 32 }}>📭</span>,
    title: 'メッセージはありません',
    description: '新しいメッセージが届くとここに表示されます。',
  },
};

export const WithAction: Story = {
  args: {
    icon: <span style={{ fontSize: 32 }}>📋</span>,
    title: '項目がありません',
    description: '最初の項目を作成しましょう。',
    action: (
      <button className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        作成
      </button>
    ),
  },
};

export const Dashed: Story = {
  args: {
    title: 'まだ章がありません',
    description: '「+ 章を追加」から最初の章を作成してください。',
    variant: 'dashed',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '420px' }}>
        <Story />
      </div>
    ),
  ],
};

export const DashedCompact: Story = {
  args: {
    title: 'まだ章がありません',
    description: '「+ 章を追加」から最初の章を作成してください。',
    variant: 'dashed',
    className: 'py-4',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '420px' }}>
        <Story />
      </div>
    ),
  ],
};
