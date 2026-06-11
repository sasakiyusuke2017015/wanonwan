import { MenuItemList } from './MenuItemList';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MenuItemList> = {
  title: 'ナビゲーション/メニュー/MenuItemList',
  component: MenuItemList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64 rounded-lg border border-gray-200 bg-white shadow-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    menuHeader: {
      control: 'text',
      description: 'メニューのヘッダー部分',
    },
    menuItems: {
      control: 'object',
      description: 'メニュー項目の配列',
    },
    onClose: {
      action: 'menu closed',
      description: 'メニューを閉じる際のコールバック',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MenuItemList>;

// 基本表示
export const Default: Story = {
  args: {
    menuHeader: (
      <div className="text-fluid-sm font-semibold text-gray-700">
        ユーザーメニュー
      </div>
    ),
    menuItems: [
      {
        icon: 'user',
        label: 'プロフィール',
        onClick: () => console.log('プロフィールを開く'),
      },
      {
        icon: 'settings',
        label: '設定',
        onClick: () => console.log('設定を開く'),
      },
      {
        icon: 'logout',
        label: 'ログアウト',
        onClick: () => console.log('ログアウトする'),
      },
    ],
  },
};

// ヘッダーなし
export const WithoutHeader: Story = {
  args: {
    menuItems: [
      { icon: 'home', label: 'HOME' },
      { icon: 'file', label: 'ドキュメント' },
      { icon: 'folder', label: 'プロジェクト' },
    ],
  },
};

// アイコンなし
export const WithoutIcons: Story = {
  args: {
    menuHeader: (
      <div className="text-fluid-sm font-semibold text-gray-700">操作メニュー</div>
    ),
    menuItems: [{ label: '作成' }, { label: '編集' }, { label: '削除' }],
  },
};

// 多数の項目
export const ManyItems: Story = {
  args: {
    menuHeader: (
      <div className="text-fluid-sm font-semibold text-gray-700">ナビゲーション</div>
    ),
    menuItems: [
      { icon: 'home', label: 'HOME' },
      { icon: 'user', label: 'ユーザー' },
      { icon: 'calendar', label: 'カレンダー' },
      { icon: 'chart', label: 'レポート' },
      { icon: 'settings', label: '設定' },
      { icon: 'notification', label: '通知' },
      { icon: 'help', label: 'ヘルプ' },
      { icon: 'logout', label: 'ログアウト' },
    ],
  },
};

// カスタムヘッダー
export const CustomHeader: Story = {
  args: {
    menuHeader: (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-500"></div>
        <div>
          <div className="text-fluid-sm font-bold text-gray-800">山田 太郎</div>
          <div className="text-fluid-xs text-gray-500">yamada@example.com</div>
        </div>
      </div>
    ),
    menuItems: [
      { icon: 'user', label: 'マイページ' },
      { icon: 'settings', label: 'アカウント設定' },
      { icon: 'logout', label: 'ログアウト' },
    ],
  },
};

// 空の状態
export const Empty: Story = {
  args: {
    menuHeader: (
      <div className="text-fluid-sm font-semibold text-gray-700">メニュー</div>
    ),
    menuItems: [],
  },
};

// 新しい.Item構造を使用（トランプカードアニメーション）
export const WithItemComponent: Story = {
  render: () => (
    <MenuItemList menuHeader={<div className="text-fluid-sm font-semibold text-gray-700">メニュー（アニメーション）</div>}>
      <MenuItemList.Item onClick={() => console.log('項目1')}>
        <div className="flex items-center gap-2">
          <span>📋</span>
          <span>項目 1</span>
        </div>
      </MenuItemList.Item>
      <MenuItemList.Item onClick={() => console.log('項目2')}>
        <div className="flex items-center gap-2">
          <span>✏️</span>
          <span>項目 2</span>
        </div>
      </MenuItemList.Item>
      <MenuItemList.Item onClick={() => console.log('項目3')}>
        <div className="flex items-center gap-2">
          <span>🗑️</span>
          <span>項目 3</span>
        </div>
      </MenuItemList.Item>
      <MenuItemList.Item onClick={() => console.log('項目4')}>
        <div className="flex items-center gap-2">
          <span>⚙️</span>
          <span>項目 4</span>
        </div>
      </MenuItemList.Item>
      <MenuItemList.Item onClick={() => console.log('項目5')}>
        <div className="flex items-center gap-2">
          <span>🚪</span>
          <span>項目 5</span>
        </div>
      </MenuItemList.Item>
    </MenuItemList>
  ),
};
