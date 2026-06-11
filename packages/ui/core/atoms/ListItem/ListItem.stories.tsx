import type { Meta, StoryObj } from '@storybook/react';
import { ListItem } from './ListItem';

type Story = StoryObj<typeof ListItem>;

/**
 * リストアイテムコンポーネント
 *
 * 選択・アクティブ状態やドラッグ機能を備えたリストアイテムの基本コンポーネントです。
 */
const meta: Meta<typeof ListItem> = {
  title: 'レイアウト/ListItem',
  component: ListItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      description: 'リストアイテムの中身',
      control: { type: 'text' },
    },
    isSelected: {
      description: '選択状態（青背景 + 太ボーダー）',
      control: { type: 'boolean' },
    },
    isActive: {
      description: 'アクティブ状態（薄いボーダーのみ）',
      control: { type: 'boolean' },
    },
    draggable: {
      description: 'ドラッグ可能',
      control: { type: 'boolean' },
    },
    className: {
      description: '追加のCSSクラス',
      control: { type: 'text' },
    },
  },
};

export default meta;

// デフォルト
export const Default: Story = {
  args: {
    children: 'リストアイテム',
    isSelected: false,
    isActive: false,
  },
};

// 選択状態
export const Selected: Story = {
  args: {
    children: '選択されたアイテム',
    isSelected: true,
  },
};

// アクティブ状態
export const Active: Story = {
  args: {
    children: 'アクティブなアイテム',
    isActive: true,
  },
};

// リスト表示例
export const ListExample: Story = {
  render: () => (
    <div className="w-80 border rounded-lg overflow-hidden">
      <ListItem isSelected>
        <div className="flex items-center justify-between">
          <span className="font-medium">会議メモ</span>
          <span className="text-xs text-gray-400">10:30</span>
        </div>
      </ListItem>
      <ListItem isActive>
        <div className="flex items-center justify-between">
          <span className="font-medium">タスク一覧</span>
          <span className="text-xs text-gray-400">09:15</span>
        </div>
      </ListItem>
      <ListItem>
        <div className="flex items-center justify-between">
          <span className="font-medium">議事録テンプレート</span>
          <span className="text-xs text-gray-400">昨日</span>
        </div>
      </ListItem>
      <ListItem>
        <div className="flex items-center justify-between">
          <span className="font-medium">プロジェクト計画</span>
          <span className="text-xs text-gray-400">3日前</span>
        </div>
      </ListItem>
    </div>
  ),
};
