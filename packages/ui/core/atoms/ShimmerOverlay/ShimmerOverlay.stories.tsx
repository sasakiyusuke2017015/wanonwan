import type { Meta, StoryObj } from '@storybook/react'

import { ShimmerOverlay } from './ShimmerOverlay'

type Story = StoryObj<typeof ShimmerOverlay>

/**
 * ShimmerOverlay — 遷移待ちフィードバック用の反復スイープ。
 *
 * 親要素 (`position: relative` + `overflow: hidden`) の上に重ねて使う装飾パーツ。
 * ボタン/リンクを押してから別ページに遷移し終えるまでの「押せた」感を出す。
 */
const meta: Meta<typeof ShimmerOverlay> = {
  title: 'フィードバック/ローディング/ShimmerOverlay',
  component: ShimmerOverlay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    active: {
      description: 'true の間だけスイープを重ねる',
      control: { type: 'boolean' },
    },
    className: {
      description: '追加のCSSクラス',
      control: { type: 'text' },
    },
  },
}

export default meta

/** 色付きボタンの上に重ねた例。 */
export const OnButton: Story = {
  args: { active: true },
  render: (args) => (
    <span
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 8,
        background: '#2563eb',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        padding: '8px 16px',
      }}
    >
      続きから学習
      <ShimmerOverlay {...args} />
    </span>
  ),
}

/** 暗色ボタンの上に重ねた例。 */
export const OnDarkButton: Story = {
  args: { active: true },
  render: (args) => (
    <span
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        borderRadius: 8,
        background: '#0f172a',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        padding: '8px 16px',
      }}
    >
      受講をはじめる
      <ShimmerOverlay {...args} />
    </span>
  ),
}
