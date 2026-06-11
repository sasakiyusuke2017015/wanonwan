import type { Meta, StoryObj } from '@storybook/react'

import { FloatingElements } from './FloatingElements'

const meta: Meta<typeof FloatingElements> = {
  title: '背景効果/FloatingElements',
  component: FloatingElements,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    elements: {
      control: 'object',
      description: 'フローティング要素の配列',
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100vw',
          height: '500px',
          position: 'relative',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          overflow: 'hidden',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FloatingElements>

/**
 * デフォルト
 */
export const Default: Story = {
  args: {},
}

/**
 * カスタム要素
 */
export const CustomElements: Story = {
  args: {
    elements: [
      {
        position: 'top-10 left-10',
        size: 'w-48 h-48',
        gradient: 'from-red-400/30 to-orange-400/20',
        blur: 'blur-3xl',
      },
      {
        position: 'bottom-10 right-10',
        size: 'w-64 h-64',
        gradient: 'from-blue-400/30 to-cyan-400/20',
        blur: 'blur-3xl',
        animationDelay: '1s',
      },
      {
        position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        size: 'w-80 h-80',
        gradient: 'from-green-400/20 to-emerald-400/15',
        blur: 'blur-2xl',
        animationDelay: '0.5s',
      },
    ],
  },
}

/**
 * 最小構成（1要素）
 */
export const SingleElement: Story = {
  args: {
    elements: [
      {
        position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        size: 'w-96 h-96',
        gradient: 'from-purple-500/40 to-pink-500/30',
        blur: 'blur-3xl',
      },
    ],
  },
}

/**
 * 多数の要素
 */
export const ManyElements: Story = {
  args: {
    elements: [
      {
        position: 'top-0 left-0',
        size: 'w-40 h-40',
        gradient: 'from-red-400/20 to-pink-400/15',
        blur: 'blur-2xl',
      },
      {
        position: 'top-0 right-0',
        size: 'w-48 h-48',
        gradient: 'from-blue-400/20 to-cyan-400/15',
        blur: 'blur-2xl',
        animationDelay: '0.5s',
      },
      {
        position: 'bottom-0 left-0',
        size: 'w-56 h-56',
        gradient: 'from-green-400/20 to-emerald-400/15',
        blur: 'blur-2xl',
        animationDelay: '1s',
      },
      {
        position: 'bottom-0 right-0',
        size: 'w-52 h-52',
        gradient: 'from-yellow-400/20 to-orange-400/15',
        blur: 'blur-2xl',
        animationDelay: '1.5s',
      },
      {
        position: 'top-1/2 left-1/4 -translate-y-1/2',
        size: 'w-36 h-36',
        gradient: 'from-violet-400/25 to-purple-400/20',
        blur: 'blur-xl',
        animationDelay: '2s',
      },
      {
        position: 'top-1/2 right-1/4 -translate-y-1/2',
        size: 'w-44 h-44',
        gradient: 'from-indigo-400/25 to-blue-400/20',
        blur: 'blur-xl',
        animationDelay: '2.5s',
      },
    ],
  },
}

/**
 * ウォームカラー
 */
export const WarmColors: Story = {
  args: {
    elements: [
      {
        position: 'top-0 left-1/4',
        size: 'w-80 h-80',
        gradient: 'from-red-400/25 to-orange-400/20',
        blur: 'blur-3xl',
      },
      {
        position: 'bottom-0 right-1/4',
        size: 'w-72 h-72',
        gradient: 'from-yellow-400/25 to-amber-400/20',
        blur: 'blur-3xl',
        animationDelay: '1s',
      },
      {
        position: 'top-1/3 right-1/3',
        size: 'w-64 h-64',
        gradient: 'from-orange-400/20 to-red-400/15',
        blur: 'blur-2xl',
        animationDelay: '2s',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100vw',
          height: '500px',
          position: 'relative',
          background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
          overflow: 'hidden',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

/**
 * クールカラー
 */
export const CoolColors: Story = {
  args: {
    elements: [
      {
        position: 'top-0 left-1/4',
        size: 'w-80 h-80',
        gradient: 'from-blue-400/25 to-cyan-400/20',
        blur: 'blur-3xl',
      },
      {
        position: 'bottom-0 right-1/4',
        size: 'w-72 h-72',
        gradient: 'from-teal-400/25 to-emerald-400/20',
        blur: 'blur-3xl',
        animationDelay: '1s',
      },
      {
        position: 'top-1/3 right-1/3',
        size: 'w-64 h-64',
        gradient: 'from-cyan-400/20 to-blue-400/15',
        blur: 'blur-2xl',
        animationDelay: '2s',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100vw',
          height: '500px',
          position: 'relative',
          background: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)',
          overflow: 'hidden',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

/**
 * ログイン画面風
 */
export const LoginStyle: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100vw',
          height: '600px',
          position: 'relative',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          overflow: 'hidden',
        }}
      >
        <Story />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div className="w-80 rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-bold text-gray-800">ログイン</h2>
            <p className="mt-2 text-gray-600">フローティング要素で装飾された背景</p>
            <div className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="メールアドレス"
                className="w-full rounded-lg border px-4 py-2"
              />
              <input
                type="password"
                placeholder="パスワード"
                className="w-full rounded-lg border px-4 py-2"
              />
              <button className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700">
                ログイン
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  ],
}

/**
 * ヒーローセクション風
 */
export const HeroSection: Story = {
  args: {
    elements: [
      {
        position: 'top-0 left-1/4',
        size: 'w-96 h-96',
        gradient: 'from-blue-400/15 to-indigo-400/10',
        blur: 'blur-3xl',
      },
      {
        position: 'bottom-0 right-1/4',
        size: 'w-80 h-80',
        gradient: 'from-purple-400/15 to-pink-400/10',
        blur: 'blur-3xl',
        animationDelay: '2s',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100vw',
          height: '600px',
          position: 'relative',
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
          overflow: 'hidden',
        }}
      >
        <Story />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            gap: '24px',
          }}
        >
          <h1 className="text-5xl font-bold text-gray-900">Welcome to Our App</h1>
          <p className="max-w-lg text-center text-lg text-gray-600">
            フローティング要素が柔らかい雰囲気を演出します
          </p>
          <button className="rounded-full bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700">
            始める
          </button>
        </div>
      </div>
    ),
  ],
}
