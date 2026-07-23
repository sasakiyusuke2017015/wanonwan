import type { Meta, StoryObj } from '@storybook/react'

import { SegmentedRatioBar } from './SegmentedRatioBar'

const meta: Meta<typeof SegmentedRatioBar> = {
  title: 'データ表示/SegmentedRatioBar',
  component: SegmentedRatioBar,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof SegmentedRatioBar>

export const Default: Story = {
  args: {
    segments: [
      { key: 1, label: 'AI基礎', value: 15, color: '#2563eb' },
      { key: 2, label: '生成AIツール活用', value: 15, color: '#7c3aed' },
      { key: 3, label: 'プロンプト', value: 14, color: '#0ea5e9' },
      { key: 4, label: 'AIエージェント', value: 14, color: '#16a34a' },
      { key: 5, label: '業務活用', value: 14, color: '#f59e0b' },
      { key: 6, label: 'リスク', value: 14, color: '#db2777' },
      { key: 7, label: '業務改善', value: 14, color: '#0d9488' },
    ],
  },
}

export const FallbackColors: Story = {
  name: '色未設定 (フォールバックパレット)',
  args: {
    segments: [
      { key: 1, label: 'A', value: 40 },
      { key: 2, label: 'B', value: 35 },
      { key: 3, label: 'C', value: 25 },
    ],
  },
}

export const Thick: Story = {
  name: '高さ指定',
  args: {
    height: 16,
    segments: [
      { key: 1, label: '基礎', value: 60, color: '#2563eb' },
      { key: 2, label: '応用', value: 40, color: '#f59e0b' },
    ],
  },
}
