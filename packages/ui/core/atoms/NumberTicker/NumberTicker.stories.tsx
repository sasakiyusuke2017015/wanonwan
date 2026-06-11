import type { Meta, StoryObj } from '@storybook/react'

import { NumberTicker } from './NumberTicker'

const meta: Meta<typeof NumberTicker> = {
  title: 'アニメーション/NumberTicker',
  component: NumberTicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'number',
      description: '表示する数値',
    },
    direction: {
      control: 'radio',
      options: ['up', 'down'],
      description: 'カウント方向',
    },
    delay: {
      control: 'number',
      description: 'アニメーション開始までの遅延（秒）',
    },
    decimalPlaces: {
      control: 'number',
      description: '小数点以下の桁数',
    },
    prefix: {
      control: 'text',
      description: '数値の前に付ける文字列',
    },
    suffix: {
      control: 'text',
      description: '数値の後に付ける文字列',
    },
  },
}

export default meta
type Story = StoryObj<typeof NumberTicker>

/**
 * デフォルト（カウントアップ）
 */
export const Default: Story = {
  args: {
    value: 100,
    direction: 'up',
  },
}

/**
 * カウントダウン
 */
export const CountDown: Story = {
  args: {
    value: 100,
    direction: 'down',
  },
}

/**
 * 大きな数値
 */
export const LargeNumber: Story = {
  args: {
    value: 1234567,
    direction: 'up',
  },
  render: (args) => (
    <span className="text-4xl font-bold">
      <NumberTicker {...args} />
    </span>
  ),
}

/**
 * 小数点付き
 */
export const WithDecimals: Story = {
  args: {
    value: 99.99,
    decimalPlaces: 2,
  },
  render: (args) => (
    <span className="text-3xl font-semibold">
      <NumberTicker {...args} />
    </span>
  ),
}

/**
 * プレフィックス付き（通貨）
 */
export const WithPrefix: Story = {
  args: {
    value: 1500,
    prefix: '¥',
  },
  render: (args) => (
    <span className="text-3xl font-bold text-green-600">
      <NumberTicker {...args} />
    </span>
  ),
}

/**
 * サフィックス付き（パーセント）
 */
export const WithSuffix: Story = {
  args: {
    value: 87,
    suffix: '%',
  },
  render: (args) => (
    <span className="text-3xl font-bold text-blue-600">
      <NumberTicker {...args} />
    </span>
  ),
}

/**
 * 遅延付き
 */
export const WithDelay: Story = {
  args: {
    value: 500,
    delay: 1,
  },
  render: (args) => (
    <div className="text-center">
      <span className="text-3xl font-bold">
        <NumberTicker {...args} />
      </span>
      <p className="mt-2 text-sm text-gray-500">1秒後にアニメーション開始</p>
    </div>
  ),
}

/**
 * 統計表示例
 */
export const Statistics: Story = {
  render: () => (
    <div className="flex gap-12">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">
          <NumberTicker value={1234} />
        </div>
        <p className="mt-2 text-sm text-gray-500">ユーザー数</p>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-green-600">
          <NumberTicker value={567} delay={0.2} />
        </div>
        <p className="mt-2 text-sm text-gray-500">プロジェクト</p>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-purple-600">
          <NumberTicker value={89} delay={0.4} suffix="%" />
        </div>
        <p className="mt-2 text-sm text-gray-500">達成率</p>
      </div>
    </div>
  ),
}

/**
 * 価格表示例
 */
export const PriceDisplay: Story = {
  render: () => (
    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-center text-white">
      <p className="text-lg">月額料金</p>
      <div className="my-4 text-6xl font-bold">
        <NumberTicker value={2980} prefix="¥" />
      </div>
      <p className="text-sm opacity-80">税込み</p>
    </div>
  ),
}

/**
 * ダッシュボードカード例
 */
export const DashboardCards: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <p className="text-sm text-gray-500">今月の売上</p>
        <div className="mt-2 text-3xl font-bold text-gray-800">
          <NumberTicker value={1250000} prefix="¥" />
        </div>
        <p className="mt-1 text-sm text-green-500">+12.5% 前月比</p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <p className="text-sm text-gray-500">コンバージョン率</p>
        <div className="mt-2 text-3xl font-bold text-gray-800">
          <NumberTicker value={3.42} decimalPlaces={2} suffix="%" />
        </div>
        <p className="mt-1 text-sm text-green-500">+0.8% 前月比</p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <p className="text-sm text-gray-500">アクティブユーザー</p>
        <div className="mt-2 text-3xl font-bold text-gray-800">
          <NumberTicker value={8765} delay={0.3} />
        </div>
        <p className="mt-1 text-sm text-green-500">+234 今週</p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <p className="text-sm text-gray-500">平均セッション時間</p>
        <div className="mt-2 text-3xl font-bold text-gray-800">
          <NumberTicker value={4.5} decimalPlaces={1} delay={0.5} suffix="分" />
        </div>
        <p className="mt-1 text-sm text-red-500">-0.3分 前月比</p>
      </div>
    </div>
  ),
}
