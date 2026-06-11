import type { Meta, StoryObj } from '@storybook/react'

import { Ticket } from './Ticket'

const meta: Meta<typeof Ticket> = {
  title: 'カード/Ticket',
  component: Ticket,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    notchSize: {
      control: { type: 'number', min: 8, max: 32, step: 2 },
      description: '切り欠きのサイズ（px）',
    },
  },
}

export default meta
type Story = StoryObj<typeof Ticket>

/**
 * 基本のチケット
 *
 * border-shape の arc で半円の切り欠きを輪郭として描画。
 * box-shadow も切り欠きの形に追従する。Chrome / Edge 147+ 専用。
 */
export const Default: Story = {
  args: {
    notchSize: 16,
    children: (
      <div>
        <div style={{ fontSize: 12, color: '#888' }}>2026.06.10 19:00</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>サマーミュージックフェス</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>東京ドーム / Aブロック 12列 23番</div>
      </div>
    ),
  },
}

/**
 * 半券付き
 */
export const WithStub: Story = {
  args: {
    notchSize: 16,
    children: (
      <div>
        <div style={{ fontSize: 12, color: '#888' }}>2026.06.10 19:00</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>映画『未来都市』</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>スクリーン 5 / G-12</div>
      </div>
    ),
    stub: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#888' }}>SEAT</div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>G-12</div>
      </div>
    ),
  },
}

/**
 * 切り欠きを大きく
 */
export const LargeNotch: Story = {
  args: {
    notchSize: 24,
    children: (
      <div style={{ padding: '8px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>クーポン #ABC123</div>
        <div style={{ fontSize: 14, color: '#888', marginTop: 6 }}>全品 20% OFF</div>
      </div>
    ),
  },
}
