import type { Meta, StoryObj } from '@storybook/react';

import { AppShell } from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'テンプレート/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  args: {
    header: (
      <div className="h-12 bg-indigo-600 text-white flex items-center px-4 font-bold">
        ヘッダー
      </div>
    ),
    sidebar: (
      <div className="w-48 bg-gray-100 border-r p-4 text-sm text-gray-600">
        サイドバー
      </div>
    ),
    children: (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">メインコンテンツ</h1>
        <p>ここにアプリケーションのメインコンテンツが表示されます。</p>
      </div>
    ),
  },
};

export const WithStatusBar: Story = {
  args: {
    header: (
      <div className="h-12 bg-indigo-600 text-white flex items-center px-4 font-bold">
        ヘッダー
      </div>
    ),
    sidebar: (
      <div className="w-48 bg-gray-100 border-r p-4 text-sm text-gray-600">
        サイドバー
      </div>
    ),
    statusBar: (
      <div className="h-6 bg-green-100 text-green-700 text-xs flex items-center px-4">
        接続済み
      </div>
    ),
    children: (
      <div className="p-6">
        <p>ステータスバー付きのレイアウト</p>
      </div>
    ),
  },
};
