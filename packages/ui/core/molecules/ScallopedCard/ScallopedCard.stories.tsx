import type { Meta, StoryObj } from '@storybook/react'

import { ScallopedCard } from './ScallopedCard'

const meta: Meta<typeof ScallopedCard> = {
  title: 'カード/ScallopedCard',
  component: ScallopedCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ScallopedCard>

/**
 * 基本のスカラップエッジカード
 *
 * border-shape の arc を繰り返して波エッジを輪郭として描画。
 * box-shadow も波の形に追従する。Chrome / Edge 147+ 専用。
 */
export const Default: Story = {
  args: {
    children: (
      <div>
        <div style={{ fontSize: 14, color: '#888' }}>限定オファー</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>30% OFF</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>2026.06.30 まで</div>
      </div>
    ),
  },
}

/**
 * グラデーション背景
 */
export const Gradient: Story = {
  render: () => (
    <ScallopedCard>
      <div
        style={{
          background: 'linear-gradient(135deg, #ff8e53 0%, #ff3d6a 100%)',
          color: 'white',
          padding: '24px 32px',
          margin: '-24px -32px',
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.9 }}>夏のキャンペーン</div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>ご招待</div>
        <div style={{ fontSize: 12, opacity: 0.9, marginTop: 8 }}>会員限定 / 7月末まで</div>
      </div>
    </ScallopedCard>
  ),
}
