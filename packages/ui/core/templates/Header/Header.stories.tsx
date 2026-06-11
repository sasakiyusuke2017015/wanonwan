import type { Meta, StoryObj } from '@storybook/react';

import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'テンプレート/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    height: 48,
    bgColor: '#4F46E5',
    textColor: '#FFFFFF',
    leftContent: <span className="font-bold text-lg">MyApp</span>,
    rightContent: <span className="text-sm">ユーザー名</span>,
  },
};

export const WithCenter: Story = {
  args: {
    height: 56,
    bgColor: '#1F2937',
    textColor: '#FFFFFF',
    borderColor: '#3B82F6',
    leftContent: <span className="font-bold">Logo</span>,
    centerContent: <span className="text-sm">ダッシュボード</span>,
    rightContent: (
      <button className="rounded bg-white/20 px-3 py-1 text-sm hover:bg-white/30">
        設定
      </button>
    ),
  },
};
