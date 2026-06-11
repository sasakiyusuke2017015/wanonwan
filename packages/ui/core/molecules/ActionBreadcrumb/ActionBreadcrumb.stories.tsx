import type { Meta, StoryObj } from '@storybook/react';

import { ActionBreadcrumb } from './ActionBreadcrumb';

const meta: Meta<typeof ActionBreadcrumb> = {
  title: 'ナビゲーション/パンくず/ActionBreadcrumb',
  component: ActionBreadcrumb,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ActionBreadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: 'ホーム', onClick: () => {} },
      { label: '設定', onClick: () => {} },
      { label: '詳細' },
    ],
  },
};

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'トップ', onClick: () => {} },
      { label: 'カテゴリ', onClick: () => {} },
      { label: 'アイテム' },
    ],
    separator: '>',
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'ダッシュボード' }],
  },
};

export const DeepHierarchy: Story = {
  args: {
    items: [
      { label: 'ホーム', onClick: () => {} },
      { label: '管理', onClick: () => {} },
      { label: 'ユーザー', onClick: () => {} },
      { label: 'ロール設定', onClick: () => {} },
      { label: '権限詳細' },
    ],
    separator: '/',
  },
};
