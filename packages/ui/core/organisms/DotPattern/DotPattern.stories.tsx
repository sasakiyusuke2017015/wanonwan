import type { Meta, StoryObj } from '@storybook/react'

import { DotPattern } from './DotPattern'

const meta: Meta<typeof DotPattern> = {
  title: '背景効果/DotPattern',
  component: DotPattern,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number', min: 8, max: 64, step: 4 },
      description: 'パターンの幅',
    },
    height: {
      control: { type: 'number', min: 8, max: 64, step: 4 },
      description: 'パターンの高さ',
    },
    cr: {
      control: { type: 'number', min: 0.5, max: 5, step: 0.5 },
      description: 'ドットの半径',
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
type Story = StoryObj<typeof DotPattern>

/**
 * デフォルト
 */
export const Default: Story = {
  args: {},
}

/**
 * 密なドット
 */
export const Dense: Story = {
  args: {
    width: 10,
    height: 10,
    cr: 0.8,
  },
}

/**
 * 疎なドット
 */
export const Sparse: Story = {
  args: {
    width: 32,
    height: 32,
    cr: 1.5,
  },
}

/**
 * 大きなドット
 */
export const LargeDots: Story = {
  args: {
    width: 24,
    height: 24,
    cr: 3,
  },
}

/**
 * カラーバリエーション
 */
export const ColorVariations: Story = {
  render: () => (
    <div className="grid h-96 grid-cols-3">
      <div className="relative bg-white">
        <DotPattern className="fill-blue-400/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium text-blue-600">Blue</span>
        </div>
      </div>
      <div className="relative bg-gray-900">
        <DotPattern className="fill-green-400/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium text-green-400">Green</span>
        </div>
      </div>
      <div className="relative bg-purple-50">
        <DotPattern className="fill-purple-400/50" />
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
      <DotPattern className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-3xl font-bold text-gray-800">中心にフォーカス</h2>
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
    <div className="relative h-96 w-full bg-gray-50">
      <DotPattern className="fill-gray-300/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl bg-white/90 p-8 text-center shadow-xl backdrop-blur">
          <h2 className="text-2xl font-bold text-gray-800">ドットパターン背景</h2>
          <p className="mt-2 text-gray-600">
            背景にドットパターンを使用してテクスチャを追加
          </p>
        </div>
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
    <div className="relative h-[500px] w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <DotPattern
        width={20}
        height={20}
        cr={1}
        className="fill-blue-500/30 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold text-gray-900">Welcome</h1>
        <p className="max-w-md text-center text-lg text-gray-600">
          ドットパターンで視覚的な深みを追加
        </p>
        <button className="rounded-full bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700">
          始める
        </button>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * カード背景
 */
export const CardBackground: Story = {
  render: () => (
    <div className="flex h-96 items-center justify-center bg-gray-100 p-8">
      <div className="relative w-80 overflow-hidden rounded-2xl bg-white shadow-xl">
        <DotPattern
          width={12}
          height={12}
          cr={0.6}
          className="fill-gray-200/80"
        />
        <div className="relative z-10 p-6">
          <div className="mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">カードタイトル</h3>
          <p className="mt-2 text-gray-500">
            ドットパターンを背景に使用したカードコンポーネント
          </p>
        </div>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}
