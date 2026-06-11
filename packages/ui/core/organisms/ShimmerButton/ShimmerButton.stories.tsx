import type { Meta, StoryObj } from '@storybook/react'

import { ShimmerButton } from './ShimmerButton'

const meta: Meta<typeof ShimmerButton> = {
  title: '入力/ボタン/ShimmerButton',
  component: ShimmerButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    shimmerColor: {
      control: 'color',
      description: 'シマーエフェクトの色',
    },
    shimmerSize: {
      control: 'text',
      description: 'シマーの大きさ',
    },
    shimmerDuration: {
      control: 'text',
      description: 'シマーアニメーションの持続時間',
    },
    borderRadius: {
      control: 'text',
      description: '角丸',
    },
    background: {
      control: 'text',
      description: '背景色',
    },
  },
}

export default meta
type Story = StoryObj<typeof ShimmerButton>

/**
 * デフォルト（黒背景 + 白シマー）
 */
export const Default: Story = {
  args: {
    children: 'Shimmer Button',
  },
}

/**
 * カラーバリエーション
 */
export const ColorVariations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ShimmerButton
        shimmerColor="#ffffff"
        background="rgba(0, 0, 0, 1)"
      >
        Default
      </ShimmerButton>
      <ShimmerButton
        shimmerColor="#60a5fa"
        background="rgba(30, 64, 175, 1)"
      >
        Blue
      </ShimmerButton>
      <ShimmerButton
        shimmerColor="#4ade80"
        background="rgba(22, 101, 52, 1)"
      >
        Green
      </ShimmerButton>
      <ShimmerButton
        shimmerColor="#f472b6"
        background="rgba(157, 23, 77, 1)"
      >
        Pink
      </ShimmerButton>
      <ShimmerButton
        shimmerColor="#fbbf24"
        background="rgba(146, 64, 14, 1)"
      >
        Amber
      </ShimmerButton>
    </div>
  ),
}

/**
 * 角丸バリエーション
 */
export const BorderRadiusVariations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ShimmerButton borderRadius="0px">
        Square
      </ShimmerButton>
      <ShimmerButton borderRadius="8px">
        Rounded 8px
      </ShimmerButton>
      <ShimmerButton borderRadius="16px">
        Rounded 16px
      </ShimmerButton>
      <ShimmerButton borderRadius="100px">
        Pill (default)
      </ShimmerButton>
    </div>
  ),
}

/**
 * アニメーション速度
 */
export const AnimationSpeed: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ShimmerButton shimmerDuration="1s">
        Fast (1s)
      </ShimmerButton>
      <ShimmerButton shimmerDuration="3s">
        Normal (3s)
      </ShimmerButton>
      <ShimmerButton shimmerDuration="6s">
        Slow (6s)
      </ShimmerButton>
    </div>
  ),
}

/**
 * シマーサイズ
 */
export const ShimmerSizeVariations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ShimmerButton shimmerSize="0.02em">
        Subtle
      </ShimmerButton>
      <ShimmerButton shimmerSize="0.05em">
        Normal
      </ShimmerButton>
      <ShimmerButton shimmerSize="0.1em">
        Large
      </ShimmerButton>
    </div>
  ),
}

/**
 * グラデーション背景
 */
export const GradientBackgrounds: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ShimmerButton
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        shimmerColor="#ffffff"
      >
        Purple Gradient
      </ShimmerButton>
      <ShimmerButton
        background="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        shimmerColor="#ffffff"
      >
        Pink Gradient
      </ShimmerButton>
      <ShimmerButton
        background="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        shimmerColor="#ffffff"
      >
        Blue Gradient
      </ShimmerButton>
    </div>
  ),
}

/**
 * CTA ボタン例
 */
export const CTAExample: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-2xl font-bold text-white">今すぐ始めましょう</h2>
      <p className="text-gray-300">無料トライアルで体験できます</p>
      <ShimmerButton
        shimmerColor="#fbbf24"
        background="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
        className="text-lg font-semibold px-8 py-4"
      >
        無料で始める
      </ShimmerButton>
    </div>
  ),
}

/**
 * ダークモード向け
 */
export const ForDarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="flex gap-4">
      <ShimmerButton
        shimmerColor="#818cf8"
        background="rgba(49, 46, 129, 0.8)"
      >
        Subscribe
      </ShimmerButton>
      <ShimmerButton
        shimmerColor="#34d399"
        background="rgba(6, 78, 59, 0.8)"
      >
        Get Started
      </ShimmerButton>
    </div>
  ),
}

/**
 * ライトモード向け
 */
export const ForLightMode: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="flex gap-4">
      <ShimmerButton
        shimmerColor="#3b82f6"
        background="rgba(255, 255, 255, 1)"
        className="text-gray-800 border-gray-200"
      >
        Learn More
      </ShimmerButton>
      <ShimmerButton
        shimmerColor="#ffffff"
        background="rgba(37, 99, 235, 1)"
      >
        Get Started
      </ShimmerButton>
    </div>
  ),
}
