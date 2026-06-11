import { LoadingOverlay } from './LoadingOverlay';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LoadingOverlay> = {
  title: 'フィードバック/ローディング/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    message: {
      control: 'text',
      description: '読み込み中のメッセージ',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

// デフォルトメッセージ
export const Default: Story = {
  args: {},
};

// カスタムメッセージ
export const CustomMessage: Story = {
  args: {
    message: 'ファイルをアップロード中...',
  },
};

// 短いメッセージ
export const ShortMessage: Story = {
  args: {
    message: '処理中',
  },
};

// 長いメッセージ
export const LongMessage: Story = {
  args: {
    message: 'サーバーからデータを取得しています。しばらくお待ちください...',
  },
};

// さまざまなシナリオ
export const Saving: Story = {
  args: {
    message: '保存しています...',
  },
};

export const Uploading: Story = {
  args: {
    message: 'ファイルをアップロードしています...',
  },
};

export const Deleting: Story = {
  args: {
    message: '削除しています...',
  },
};

export const Processing: Story = {
  args: {
    message: 'データを処理しています...',
  },
};

// 使用例: コンテンツ上にオーバーレイ
export const OverContent: Story = {
  render: () => (
    <div className="relative h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="p-8">
        <h1 className="mb-4 text-fluid-3xl font-bold text-gray-800">
          ダッシュボード
        </h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-fluid-lg font-semibold text-gray-700">
              カード 1
            </h2>
            <p className="text-gray-600">コンテンツ...</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-fluid-lg font-semibold text-gray-700">
              カード 2
            </h2>
            <p className="text-gray-600">コンテンツ...</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-fluid-lg font-semibold text-gray-700">
              カード 3
            </h2>
            <p className="text-gray-600">コンテンツ...</p>
          </div>
        </div>
      </div>
      <LoadingOverlay message="データを読み込んでいます..." />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};
