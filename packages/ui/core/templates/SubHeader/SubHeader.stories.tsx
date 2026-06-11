import type { Meta, StoryObj } from '@storybook/react';

import { SubHeader } from './SubHeader';

const meta: Meta<typeof SubHeader> = {
  title: 'テンプレート/SubHeader',
  component: SubHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SubHeader>;

export const Default: Story = {
  args: {
    topOffset: 0,
    children: (
      <div className="flex items-center gap-4 bg-white border-b px-4 py-2 shadow-sm">
        <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">概要</button>
        <button className="text-sm text-gray-500 hover:text-gray-700 pb-1">詳細</button>
        <button className="text-sm text-gray-500 hover:text-gray-700 pb-1">履歴</button>
      </div>
    ),
  },
};

export const WithLeftOffset: Story = {
  args: {
    topOffset: 48,
    leftOffset: 240,
    children: (
      <div className="flex items-center gap-2 bg-gray-50 border-b px-4 py-2">
        <span className="text-sm text-gray-600">フィルター:</span>
        <button className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">全て</button>
        <button className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">アクティブ</button>
      </div>
    ),
  },
};
