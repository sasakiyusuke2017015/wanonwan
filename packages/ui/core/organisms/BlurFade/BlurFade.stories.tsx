import type { Meta, StoryObj } from '@storybook/react'

import { BlurFade } from './BlurFade'

const meta: Meta<typeof BlurFade> = {
  title: 'アニメーション/BlurFade',
  component: BlurFade,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: { type: 'number', min: 0.1, max: 2, step: 0.1 },
      description: 'アニメーション時間（秒）',
    },
    delay: {
      control: { type: 'number', min: 0, max: 2, step: 0.1 },
      description: '遅延時間（秒）',
    },
    yOffset: {
      control: { type: 'number', min: 0, max: 50, step: 2 },
      description: 'Y軸オフセット（px）',
    },
    blur: {
      control: 'text',
      description: 'ブラーの強さ（例: "6px"）',
    },
    inView: {
      control: 'boolean',
      description: 'ビューポート内に入った時にアニメーション開始',
    },
  },
}

export default meta
type Story = StoryObj<typeof BlurFade>

/**
 * デフォルト
 */
export const Default: Story = {
  args: {
    children: (
      <div className="rounded-lg bg-blue-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-800">BlurFade</h2>
        <p className="mt-2 text-blue-600">ブラーしながらフェードイン</p>
      </div>
    ),
  },
}

/**
 * テキストコンテンツ
 */
export const TextContent: Story = {
  args: {
    children: (
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800">ようこそ</h1>
        <p className="mt-4 text-gray-600">
          このコンポーネントはブラーエフェクトと共にフェードインします。
          視覚的に魅力的な登場アニメーションを実現します。
        </p>
      </div>
    ),
    duration: 0.6,
  },
}

/**
 * カード
 */
export const Card: Story = {
  args: {
    children: (
      <div className="w-80 rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
        <h3 className="text-xl font-semibold">機能カード</h3>
        <p className="mt-2 text-gray-500">
          BlurFadeを使用して、カードが美しく表示されます。
        </p>
      </div>
    ),
  },
}

/**
 * 遅延バリエーション
 */
export const StaggeredItems: Story = {
  render: () => (
    <div className="space-y-4">
      <BlurFade delay={0}>
        <div className="rounded-lg bg-red-100 p-4">Item 1 (delay: 0)</div>
      </BlurFade>
      <BlurFade delay={0.2}>
        <div className="rounded-lg bg-orange-100 p-4">Item 2 (delay: 0.2s)</div>
      </BlurFade>
      <BlurFade delay={0.4}>
        <div className="rounded-lg bg-yellow-100 p-4">Item 3 (delay: 0.4s)</div>
      </BlurFade>
      <BlurFade delay={0.6}>
        <div className="rounded-lg bg-green-100 p-4">Item 4 (delay: 0.6s)</div>
      </BlurFade>
      <BlurFade delay={0.8}>
        <div className="rounded-lg bg-blue-100 p-4">Item 5 (delay: 0.8s)</div>
      </BlurFade>
    </div>
  ),
}

/**
 * グリッドレイアウト
 */
export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <BlurFade key={i} delay={i * 0.1}>
          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            {i + 1}
          </div>
        </BlurFade>
      ))}
    </div>
  ),
}

/**
 * ブラー強度バリエーション
 */
export const BlurIntensity: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="text-center">
        <BlurFade blur="2px" delay={0}>
          <div className="rounded-lg bg-blue-100 p-6">Subtle (2px)</div>
        </BlurFade>
      </div>
      <div className="text-center">
        <BlurFade blur="6px" delay={0.2}>
          <div className="rounded-lg bg-blue-100 p-6">Normal (6px)</div>
        </BlurFade>
      </div>
      <div className="text-center">
        <BlurFade blur="12px" delay={0.4}>
          <div className="rounded-lg bg-blue-100 p-6">Strong (12px)</div>
        </BlurFade>
      </div>
    </div>
  ),
}

/**
 * Y オフセットバリエーション
 */
export const YOffsetVariations: Story = {
  render: () => (
    <div className="flex gap-8">
      <BlurFade yOffset={0} delay={0}>
        <div className="rounded-lg bg-green-100 p-6">No offset (0)</div>
      </BlurFade>
      <BlurFade yOffset={10} delay={0.2}>
        <div className="rounded-lg bg-green-100 p-6">Small (10px)</div>
      </BlurFade>
      <BlurFade yOffset={20} delay={0.4}>
        <div className="rounded-lg bg-green-100 p-6">Large (20px)</div>
      </BlurFade>
    </div>
  ),
}

/**
 * ヒーローセクション例
 */
export const HeroSection: Story = {
  render: () => (
    <div className="space-y-6 text-center">
      <BlurFade delay={0}>
        <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
          New Release
        </span>
      </BlurFade>
      <BlurFade delay={0.1}>
        <h1 className="text-5xl font-bold text-gray-900">
          Build faster with
          <br />
          <span className="text-blue-600">Modern UI</span>
        </h1>
      </BlurFade>
      <BlurFade delay={0.2}>
        <p className="mx-auto max-w-lg text-lg text-gray-600">
          美しいアニメーションとモダンなデザインで、
          ユーザー体験を向上させましょう。
        </p>
      </BlurFade>
      <BlurFade delay={0.3}>
        <div className="flex justify-center gap-4">
          <button className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            始める
          </button>
          <button className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
            詳細を見る
          </button>
        </div>
      </BlurFade>
    </div>
  ),
}

/**
 * 画像ギャラリー例
 */
export const ImageGallery: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <BlurFade key={i} delay={i * 0.15}>
          <div
            className="aspect-square rounded-xl bg-gradient-to-br shadow-lg"
            style={{
              backgroundImage: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%), hsl(${i * 60 + 30}, 70%, 50%))`,
            }}
          />
        </BlurFade>
      ))}
    </div>
  ),
}
