import type { Meta, StoryObj } from '@storybook/react';
import { CountdownRing } from './CountdownRing';

type Story = StoryObj<typeof CountdownRing>;

/**
 * SVG円形カウントダウンリング
 *
 * 指定した時間でリングが減少し、秒数を表示するカウントダウンコンポーネントです。
 */
const meta: Meta<typeof CountdownRing> = {
  title: 'データ可視化/その他/CountdownRing',
  component: CountdownRing,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    durationMs: {
      description: 'カウントダウンの合計時間（ミリ秒）',
      control: { type: 'number' },
    },
    startKey: {
      description: 'アニメーション再開用のキー（変更すると再スタート）',
      control: { type: 'text' },
    },
    radius: {
      description: 'リングの半径（デフォルト: 18）',
      control: { type: 'number' },
    },
    size: {
      description: 'SVG viewBoxのサイズ（デフォルト: 48）',
      control: { type: 'number' },
    },
    strokeWidth: {
      description: 'ストロークの太さ（デフォルト: 3）',
      control: { type: 'number' },
    },
    strokeColor: {
      description: 'ストロークの色（デフォルト: "white"）',
      control: { type: 'color' },
    },
    trackOpacity: {
      description: 'トラックの透明度（デフォルト: 0.2）',
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
    numberClassName: {
      description: '数字表示の追加CSSクラス',
      control: { type: 'text' },
    },
    className: {
      description: 'ラッパーの追加CSSクラス',
      control: { type: 'text' },
    },
  },
};

export default meta;

// デフォルト（10秒カウントダウン）
export const Default: Story = {
  args: {
    durationMs: 10000,
    startKey: 'default',
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#334155', padding: 24, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

// 短いカウントダウン（5秒）
export const Short: Story = {
  args: {
    durationMs: 5000,
    startKey: 'short',
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#334155', padding: 24, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

// 長いカウントダウン（30秒）
export const Long: Story = {
  args: {
    durationMs: 30000,
    startKey: 'long',
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#334155', padding: 24, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

// 大きいサイズ
export const Large: Story = {
  args: {
    durationMs: 10000,
    startKey: 'large',
    radius: 36,
    size: 96,
    strokeWidth: 5,
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#334155', padding: 24, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

// カスタムカラー
export const CustomColor: Story = {
  args: {
    durationMs: 15000,
    startKey: 'color',
    strokeColor: '#22d3ee',
    strokeWidth: 4,
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1e293b', padding: 24, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};
