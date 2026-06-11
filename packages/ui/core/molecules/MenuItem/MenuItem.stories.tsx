import { MenuItem } from '../../molecules/MenuItem/MenuItem';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MenuItem> = {
  title: 'ナビゲーション/メニュー/MenuItem',
  component: MenuItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    icon: {
      control: 'text',
      description: 'アイコン名またはReactNode',
    },
    label: {
      control: 'text',
      description: 'メニュー項目のラベル',
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のコールバック',
    },
    onClose: {
      action: 'closed',
      description: 'メニューを閉じる際のコールバック',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MenuItem>;

// 基本表示
export const Default: Story = {
  args: {
    icon: 'home',
    label: 'HOME',
  },
};

// アイコンのみ
export const IconOnly: Story = {
  args: {
    icon: 'settings',
  },
};

// ラベルのみ
export const LabelOnly: Story = {
  args: {
    label: 'プロフィール設定',
  },
};

// さまざまなアイコン
export const WithUserIcon: Story = {
  args: {
    icon: 'user',
    label: 'ユーザー管理',
  },
};

export const WithFileIcon: Story = {
  args: {
    icon: 'file',
    label: 'ドキュメント',
  },
};

export const WithLogoutIcon: Story = {
  args: {
    icon: 'logout',
    label: 'ログアウト',
  },
};

// 複数のメニュー項目
export const MultipleItems: Story = {
  render: () => (
    <>
      <MenuItem icon="home" label="HOME" />
      <MenuItem icon="user" label="プロフィール" />
      <MenuItem icon="settings" label="設定" />
      <MenuItem icon="logout" label="ログアウト" />
    </>
  ),
};
