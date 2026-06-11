import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

type Story = StoryObj<typeof Spinner>;

/**
 * ローディングスピナーコンポーネント
 *
 * サイズとバリアント（色）を指定できるシンプルなスピナーです。
 */
const meta: Meta<typeof Spinner> = {
  title: 'フィードバック/ローディング/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'スピナーのサイズ',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      description: 'スピナーのカラーバリアント',
      control: { type: 'select' },
      options: ['default', 'info', 'success', 'warning', 'error'],
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
    size: 'md',
    variant: 'info',
  },
};

// サイズバリエーション
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Spinner size={size} variant="info" />
          <span className="text-xs text-gray-500">{size}</span>
        </div>
      ))}
    </div>
  ),
};

// カラーバリエーション
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['default', 'info', 'success', 'warning', 'error'] as const).map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <Spinner size="lg" variant={variant} />
          <span className="text-xs text-gray-500">{variant}</span>
        </div>
      ))}
    </div>
  ),
};

// 小サイズ
export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'info',
  },
};

// 大サイズ
export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'success',
  },
};
