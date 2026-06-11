import type { Meta, StoryObj } from '@storybook/react'

import { GridPattern } from './GridPattern'

const meta: Meta<typeof GridPattern> = {
  title: '背景効果/GridPattern',
  component: GridPattern,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number', min: 10, max: 100, step: 5 },
      description: 'グリッドセルの幅',
    },
    height: {
      control: { type: 'number', min: 10, max: 100, step: 5 },
      description: 'グリッドセルの高さ',
    },
    strokeDasharray: {
      control: 'text',
      description: '線のダッシュパターン',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '400px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof GridPattern>

/**
 * デフォルト
 */
export const Default: Story = {
  args: {},
}

/**
 * 小さいグリッド
 */
export const SmallGrid: Story = {
  args: {
    width: 20,
    height: 20,
  },
}

/**
 * 大きいグリッド
 */
export const LargeGrid: Story = {
  args: {
    width: 80,
    height: 80,
  },
}

/**
 * ダッシュライン
 */
export const Dashed: Story = {
  args: {
    strokeDasharray: '4 4',
  },
}

/**
 * 点線
 */
export const Dotted: Story = {
  args: {
    strokeDasharray: '1 6',
  },
}

/**
 * ハイライトセル付き
 */
export const WithSquares: Story = {
  args: {
    width: 40,
    height: 40,
    squares: [
      [1, 1],
      [2, 3],
      [4, 2],
      [3, 4],
      [5, 5],
    ],
  },
}

/**
 * カラーバリエーション
 */
export const ColorVariations: Story = {
  render: () => (
    <div className="grid h-96 grid-cols-3">
      <div className="relative bg-white">
        <GridPattern className="stroke-blue-300/50 fill-blue-200/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium text-blue-600">Blue</span>
        </div>
      </div>
      <div className="relative bg-gray-900">
        <GridPattern className="stroke-green-500/40 fill-green-400/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium text-green-400">Green</span>
        </div>
      </div>
      <div className="relative bg-purple-50">
        <GridPattern className="stroke-purple-400/50 fill-purple-300/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium text-purple-600">Purple</span>
        </div>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * グラデーションマスク付き
 */
export const WithGradientMask: Story = {
  render: () => (
    <div className="relative h-96 w-full bg-white">
      <GridPattern
        width={30}
        height={30}
        className="[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-3xl font-bold text-gray-800">中心から広がるグリッド</h2>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * コンテンツと組み合わせ
 */
export const WithContent: Story = {
  render: () => (
    <div className="relative h-96 w-full bg-slate-50">
      <GridPattern className="stroke-slate-200 fill-slate-100/50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl bg-white/90 p-8 text-center shadow-xl backdrop-blur">
          <h2 className="text-2xl font-bold text-gray-800">グリッドパターン背景</h2>
          <p className="mt-2 text-gray-600">
            技術系・モダンなデザインに適した背景パターン
          </p>
        </div>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * ダークモード向け
 */
export const DarkMode: Story = {
  render: () => (
    <div className="relative h-96 w-full bg-gray-900">
      <GridPattern
        width={50}
        height={50}
        className="stroke-gray-700/50 fill-transparent"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-3xl font-bold text-white">Dark Mode Grid</h2>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * ヒーローセクション風
 */
export const HeroSection: Story = {
  render: () => (
    <div className="relative h-[500px] w-full bg-gradient-to-br from-indigo-50 to-blue-100">
      <GridPattern
        width={40}
        height={40}
        className="stroke-indigo-200/60 fill-transparent [mask-image:linear-gradient(to_bottom,white_50%,transparent)]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold text-gray-900">Technical Docs</h1>
        <p className="max-w-md text-center text-lg text-gray-600">
          グリッドパターンで技術的な印象を演出
        </p>
        <button className="rounded-full bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700">
          ドキュメントを見る
        </button>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * ブループリント風
 */
export const Blueprint: Story = {
  render: () => (
    <div className="relative h-96 w-full bg-blue-900">
      <GridPattern
        width={25}
        height={25}
        className="stroke-blue-400/40 fill-transparent"
      />
      <GridPattern
        width={100}
        height={100}
        className="stroke-blue-300/50 fill-transparent"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-3xl font-bold text-blue-100">Blueprint Style</h2>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}
