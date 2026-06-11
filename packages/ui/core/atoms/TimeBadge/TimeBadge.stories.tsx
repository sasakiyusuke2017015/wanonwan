import type { Meta, StoryObj } from '@storybook/react';
import { TimeBadge } from './TimeBadge';

type Story = StoryObj<typeof TimeBadge>;

/**
 * 時間範囲表示用バッジコンポーネント
 *
 * 時間範囲やタイムスタンプを表示するためのバッジです。
 * 複数のカラーバリアントとサイズをサポートします。
 */
const meta: Meta<typeof TimeBadge> = {
  title: '表示/コンテンツ/TimeBadge',
  component: TimeBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      description: '表示するテキスト（時間範囲など）',
      control: { type: 'text' },
    },
    variant: {
      description: 'カラーバリアント',
      control: { type: 'select' },
      options: ['teal', 'purple', 'orange', 'blue', 'gray'],
    },
    size: {
      description: 'サイズ（sm: text-xs, md: text-sm）',
      control: { type: 'select' },
      options: ['sm', 'md'],
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
    children: '0:00 ~ 5:30',
    variant: 'teal',
    size: 'sm',
  },
};

// カラーバリエーション
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['teal', 'purple', 'orange', 'blue', 'gray'] as const).map((variant) => (
        <TimeBadge key={variant} variant={variant}>
          {variant}: 0:00 ~ 5:30
        </TimeBadge>
      ))}
    </div>
  ),
};

// サイズバリエーション
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <TimeBadge variant="teal" size="sm">0:00 ~ 5:30</TimeBadge>
        <span className="text-xs text-gray-500">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <TimeBadge variant="teal" size="md">0:00 ~ 5:30</TimeBadge>
        <span className="text-xs text-gray-500">md</span>
      </div>
    </div>
  ),
};

// 実用例
export const UseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-fluid-sm font-semibold">会議タイムライン</h3>
        <div className="flex flex-wrap gap-2">
          <TimeBadge variant="teal">0:00 ~ 5:30</TimeBadge>
          <TimeBadge variant="purple">5:30 ~ 15:00</TimeBadge>
          <TimeBadge variant="orange">15:00 ~ 25:00</TimeBadge>
          <TimeBadge variant="blue">25:00 ~ 30:00</TimeBadge>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-fluid-sm font-semibold">ステータス表示</h3>
        <div className="flex flex-wrap gap-2">
          <TimeBadge variant="gray" size="md">未定</TimeBadge>
          <TimeBadge variant="blue" size="md">10:00 ~ 11:00</TimeBadge>
        </div>
      </div>
    </div>
  ),
};
