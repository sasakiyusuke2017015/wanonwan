import type { Meta, StoryObj } from '@storybook/react'

import { GradientOverlay } from './GradientOverlay'

const meta: Meta<typeof GradientOverlay> = {
  title: '背景効果/GradientOverlay',
  component: GradientOverlay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    background: {
      control: 'text',
      description: 'グラデーション背景（CSSグラデーション形式）',
    },
    maxOpacity: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 },
      description: '最大透明度',
    },
    delay: {
      control: 'number',
      description: 'アニメーション遅延（秒）',
    },
    duration: {
      control: { type: 'number', min: 5, max: 60, step: 5 },
      description: 'アニメーション持続時間（秒）',
    },
    animationType: {
      control: 'select',
      options: ['none', 'wave', 'randomColor'],
      description: 'アニメーションタイプ',
    },
    animationDirection: {
      control: 'select',
      options: ['horizontal', 'diagonal-up', 'diagonal-down', 'vertical'],
      description: 'アニメーション方向',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '400px', position: 'relative', background: '#1a1a2e' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof GradientOverlay>

/**
 * デフォルト（静的グラデーション）
 */
export const Default: Story = {
  args: {
    background:
      'linear-gradient(135deg, rgba(255,154,158,0.4), rgba(250,208,196,0.3), rgba(255,206,84,0.2))',
    maxOpacity: 1,
    animationType: 'none',
  },
}

/**
 * 波アニメーション（横方向）
 */
export const WaveHorizontal: Story = {
  args: {
    animationType: 'wave',
    animationDirection: 'horizontal',
    duration: 15,
    animationGradient:
      'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), rgba(255,223,0,0.6), rgba(255,215,0,0.4), transparent)',
  },
}

/**
 * 波アニメーション（斜め上）
 */
export const WaveDiagonalUp: Story = {
  args: {
    animationType: 'wave',
    animationDirection: 'diagonal-up',
    duration: 20,
    animationGradient:
      'linear-gradient(90deg, transparent, rgba(100,200,255,0.5), rgba(150,220,255,0.7), rgba(100,200,255,0.5), transparent)',
  },
}

/**
 * 波アニメーション（斜め下）
 */
export const WaveDiagonalDown: Story = {
  args: {
    animationType: 'wave',
    animationDirection: 'diagonal-down',
    duration: 18,
    animationGradient:
      'linear-gradient(90deg, transparent, rgba(255,100,150,0.5), rgba(255,150,180,0.7), rgba(255,100,150,0.5), transparent)',
  },
}

/**
 * 波アニメーション（縦方向）
 */
export const WaveVertical: Story = {
  args: {
    animationType: 'wave',
    animationDirection: 'vertical',
    duration: 25,
    animationGradient:
      'linear-gradient(90deg, transparent, rgba(150,255,150,0.4), rgba(100,255,100,0.6), rgba(150,255,150,0.4), transparent)',
  },
}

/**
 * ランダムカラー変化
 */
export const RandomColor: Story = {
  args: {
    animationType: 'randomColor',
    duration: 8,
    colorRanges: {
      r: { min: 100, max: 255 },
      g: { min: 100, max: 255 },
      b: { min: 100, max: 255 },
      a: { min: 0.3, max: 0.6 },
    },
  },
}

/**
 * カスタムカラーレンジ（青系）
 */
export const BlueColorRange: Story = {
  args: {
    animationType: 'randomColor',
    duration: 10,
    colorRanges: {
      r: { min: 50, max: 100 },
      g: { min: 100, max: 200 },
      b: { min: 200, max: 255 },
      a: { min: 0.4, max: 0.7 },
    },
  },
}

/**
 * カスタムカラーレンジ（緑系）
 */
export const GreenColorRange: Story = {
  args: {
    animationType: 'randomColor',
    duration: 12,
    colorRanges: {
      r: { min: 50, max: 150 },
      g: { min: 180, max: 255 },
      b: { min: 80, max: 150 },
      a: { min: 0.3, max: 0.5 },
    },
  },
}

/**
 * ログイン画面風
 */
export const LoginStyle: Story = {
  args: {
    animationType: 'wave',
    animationDirection: 'diagonal-up',
    duration: 30,
    animationGradient:
      'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.5), rgba(99,102,241,0.4), transparent)',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100vw',
          height: '500px',
          position: 'relative',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
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
          <div className="rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-bold text-gray-800">ログイン</h2>
            <p className="mt-2 text-gray-600">美しいグラデーションアニメーション背景</p>
          </div>
        </div>
      </div>
    ),
  ],
}

/**
 * 静的なグラデーション比較
 */
export const StaticGradients: Story = {
  render: () => (
    <div className="grid h-96 grid-cols-3">
      <div className="relative">
        <GradientOverlay
          background="linear-gradient(135deg, rgba(255,0,100,0.3), rgba(255,150,200,0.2))"
          animationType="none"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-medium">Pink</span>
        </div>
      </div>
      <div className="relative">
        <GradientOverlay
          background="linear-gradient(135deg, rgba(0,100,255,0.3), rgba(100,200,255,0.2))"
          animationType="none"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-medium">Blue</span>
        </div>
      </div>
      <div className="relative">
        <GradientOverlay
          background="linear-gradient(135deg, rgba(100,255,100,0.3), rgba(200,255,200,0.2))"
          animationType="none"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-medium">Green</span>
        </div>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}
