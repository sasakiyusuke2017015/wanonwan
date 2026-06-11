import type { Meta, StoryObj } from '@storybook/react';

import { ContextMenu } from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'ナビゲーション/メニュー/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    position: {
      control: 'object',
      description: 'メニューの表示位置 { x, y }',
    },
    items: {
      control: 'object',
      description: 'メニュー項目の配列',
    },
    onClose: {
      action: 'onClose',
      description: 'メニューを閉じるコールバック',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  args: {
    position: { x: 50, y: 50 },
    items: [
      { label: '編集', onClick: () => {} },
      { label: 'コピー', onClick: () => {} },
      { label: '貼り付け', onClick: () => {} },
    ],
    onClose: () => {},
  },
  decorators: [(Story) => <div style={{ position: 'relative', width: '300px', height: '200px' }}><Story /></div>],
};

export const WithDangerItem: Story = {
  name: '危険項目あり',
  args: {
    position: { x: 50, y: 50 },
    items: [
      { label: '編集', onClick: () => {} },
      { label: '移動', onClick: () => {} },
      { label: '削除', onClick: () => {}, variant: 'danger' },
    ],
    onClose: () => {},
  },
  decorators: [(Story) => <div style={{ position: 'relative', width: '300px', height: '200px' }}><Story /></div>],
};

export const SingleItem: Story = {
  name: '単一項目',
  args: {
    position: { x: 50, y: 50 },
    items: [
      { label: '詳細を表示', onClick: () => {} },
    ],
    onClose: () => {},
  },
  decorators: [(Story) => <div style={{ position: 'relative', width: '300px', height: '200px' }}><Story /></div>],
};

export const ManyItems: Story = {
  name: '多数の項目',
  args: {
    position: { x: 50, y: 50 },
    items: [
      { label: '名前変更', onClick: () => {} },
      { label: '複製', onClick: () => {} },
      { label: '移動', onClick: () => {} },
      { label: '共有', onClick: () => {} },
      { label: 'ダウンロード', onClick: () => {} },
      { label: '削除', onClick: () => {}, variant: 'danger' },
    ],
    onClose: () => {},
  },
  decorators: [(Story) => <div style={{ position: 'relative', width: '300px', height: '300px' }}><Story /></div>],
};
