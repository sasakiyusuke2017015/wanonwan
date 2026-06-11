import type { Meta, StoryObj } from '@storybook/react';

import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'ナビゲーション/タブ/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'overview', label: '概要', content: <p>概要コンテンツ</p> },
      { id: 'details', label: '詳細', content: <p>詳細コンテンツ</p> },
      { id: 'settings', label: '設定', content: <p>設定コンテンツ</p> },
    ],
  },
};

export const WithDefaultTab: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: 'タブ1', content: <p>タブ1のコンテンツ</p> },
      { id: 'tab2', label: 'タブ2', content: <p>タブ2のコンテンツ</p> },
      { id: 'tab3', label: 'タブ3', content: <p>タブ3のコンテンツ</p> },
    ],
    defaultTab: 'tab2',
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'active', label: '有効', content: <p>有効なアイテムの一覧</p> },
      { id: 'inactive', label: '無効', content: <p>無効なアイテムの一覧</p> },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: 'all', label: 'すべて', content: <p>すべてのデータ</p> },
      { id: 'draft', label: '下書き', content: <p>下書き一覧</p> },
      { id: 'review', label: 'レビュー中', content: <p>レビュー待ちの項目</p> },
      { id: 'approved', label: '承認済み', content: <p>承認済み一覧</p> },
      { id: 'rejected', label: '却下', content: <p>却下された項目</p> },
      { id: 'archived', label: 'アーカイブ', content: <p>アーカイブ済み</p> },
    ],
  },
};

export const WithRichContent: Story = {
  args: {
    tabs: [
      {
        id: 'profile',
        label: 'プロフィール',
        content: (
          <div style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 8px' }}>田中 太郎</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>tanaka@example.com</p>
            <p style={{ color: '#6b7280', margin: '4px 0 0' }}>営業部 / マネージャー</p>
          </div>
        ),
      },
      {
        id: 'activity',
        label: 'アクティビティ',
        content: (
          <ul style={{ padding: '16px 16px 16px 32px', margin: 0 }}>
            <li>レポートを提出しました (2分前)</li>
            <li>コメントを追加しました (1時間前)</li>
            <li>タスクを完了しました (3時間前)</li>
          </ul>
        ),
      },
      {
        id: 'settings',
        label: '設定',
        content: (
          <div style={{ padding: 16, color: '#6b7280' }}>
            通知・セキュリティ等の設定項目がここに表示されます。
          </div>
        ),
      },
    ],
  },
};
