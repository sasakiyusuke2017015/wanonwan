import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardHeader, CardContent, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: '表示/カード/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ZTvv6vzLXOxlP64TLs6YHB/%E7%84%A1%E9%A1%8C?t=uGI62GQBWdy1FqLU-0',
    },
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'カードのコンテンツです。',
  },
  decorators: [(Story) => <div style={{ width: '320px' }}><Story /></div>],
};

export const NoPadding: Story = {
  args: {
    children: 'パディングなしのカード',
    padding: false,
  },
  decorators: [(Story) => <div style={{ width: '320px' }}><Story /></div>],
};

export const Clickable: Story = {
  args: {
    children: 'クリック可能なカード',
    onClick: () => {},
  },
  decorators: [(Story) => <div style={{ width: '320px' }}><Story /></div>],
};

export const WithSubComponents: Story = {
  name: 'サブコンポーネント付き',
  render: () => (
    <div style={{ width: '320px' }}>
      <Card padding={false}>
        <CardHeader>
          <h3 style={{ fontWeight: 600 }}>タイトル</h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>説明テキスト</p>
        </CardHeader>
        <CardContent>
          <p>メインコンテンツがここに入ります。</p>
        </CardContent>
        <CardFooter>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>フッター</span>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const HeaderContentOnly: Story = {
  name: 'Header + Content',
  render: () => (
    <div style={{ width: '320px' }}>
      <Card padding={false}>
        <CardHeader>
          <h3 style={{ fontWeight: 600 }}>食材カード</h3>
        </CardHeader>
        <CardContent>
          <p>鶏むね肉 - 冷蔵 / カット済み</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>残り 2日 12時間</p>
        </CardContent>
      </Card>
    </div>
  ),
};
