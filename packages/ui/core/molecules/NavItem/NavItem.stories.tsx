import type { Meta, StoryObj } from '@storybook/react';

import { NavItem } from './NavItem';

const meta: Meta<typeof NavItem> = {
  title: 'ナビゲーション/リンク/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: {
      control: 'text',
      description: '表示ラベル',
    },
    iconName: {
      control: 'select',
      options: ['home', 'folder', 'calendar', 'settings', 'users', 'search', 'star', 'bell'],
      description: 'アイコン名',
    },
    selected: {
      control: 'boolean',
      description: '選択状態',
    },
    accentColor: {
      control: 'select',
      options: ['blue', 'yellow', 'orange', 'green', 'gray', 'purple'],
      description: 'アクセントカラー',
    },
    badge: {
      control: 'text',
      description: 'バッジ（件数表示など）',
    },
    isMeetingDropTarget: {
      control: 'boolean',
      description: 'ミーティングのドロップターゲット状態',
    },
    isProjectDropTarget: {
      control: 'boolean',
      description: 'プロジェクトのドロップターゲット状態',
    },
    onClick: {
      action: 'onClick',
      description: 'クリックハンドラ',
    },
    onContextMenu: {
      action: 'onContextMenu',
      description: '右クリックハンドラ',
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    label: 'ホーム',
    iconName: 'home',
    selected: false,
    onClick: () => {},
  },
  decorators: [(Story) => <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '8px' }}><Story /></div>],
};

export const Selected: Story = {
  name: '選択状態',
  args: {
    label: 'ホーム',
    iconName: 'home',
    selected: true,
    accentColor: 'blue',
    onClick: () => {},
  },
  decorators: [(Story) => <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '8px' }}><Story /></div>],
};

export const WithBadge: Story = {
  name: 'バッジ付き',
  args: {
    label: '通知',
    iconName: 'bell',
    selected: false,
    badge: 5,
    onClick: () => {},
  },
  decorators: [(Story) => <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '8px' }}><Story /></div>],
};

export const AccentColors: Story = {
  name: 'アクセントカラー一覧',
  render: () => (
    <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <NavItem label="Blue" iconName="folder" selected accentColor="blue" onClick={() => {}} />
      <NavItem label="Green" iconName="folder" selected accentColor="green" onClick={() => {}} />
      <NavItem label="Yellow" iconName="folder" selected accentColor="yellow" onClick={() => {}} />
      <NavItem label="Orange" iconName="folder" selected accentColor="orange" onClick={() => {}} />
      <NavItem label="Purple" iconName="folder" selected accentColor="purple" onClick={() => {}} />
      <NavItem label="Gray" iconName="folder" selected accentColor="gray" onClick={() => {}} />
    </div>
  ),
};

export const SidebarExample: Story = {
  name: 'サイドバー例',
  render: () => (
    <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <NavItem label="ホーム" iconName="home" selected onClick={() => {}} />
      <NavItem label="カレンダー" iconName="calendar" onClick={() => {}} />
      <NavItem label="メンバー" iconName="users" onClick={() => {}} badge={3} />
      <NavItem label="設定" iconName="settings" onClick={() => {}} />
    </div>
  ),
};
