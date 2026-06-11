import type { Meta, StoryObj } from '@storybook/react';

import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'テンプレート/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    height: 40,
    children: <span className="text-sm text-gray-600">フッターコンテンツ</span>,
  },
};

export const WithOffset: Story = {
  args: {
    height: 40,
    leftOffset: 200,
    bottomOffset: 48,
    children: <span className="text-sm text-gray-600">オフセット付きフッター</span>,
  },
};
