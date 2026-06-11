import type { Meta, StoryObj } from '@storybook/react'

import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'フィードバック/通知/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'ツールチップに表示するテキスト',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'ツールチップの表示位置',
    },
  },
}

export default meta
type Story = StoryObj<typeof Tooltip>

/**
 * デフォルトのツールチップ（下方向）
 */
export const Default: Story = {
  args: {
    content: 'これはツールチップです',
    position: 'bottom',
  },
  render: (args) => (
    <Tooltip {...args}>
      <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        ホバーしてください
      </button>
    </Tooltip>
  ),
}

/**
 * 上方向に表示
 */
export const Top: Story = {
  args: {
    content: '上に表示されます',
    position: 'top',
  },
  render: (args) => (
    <div style={{ marginTop: '60px' }}>
      <Tooltip {...args}>
        <button className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
          上方向
        </button>
      </Tooltip>
    </div>
  ),
}

/**
 * 左方向に表示
 */
export const Left: Story = {
  args: {
    content: '左に表示されます',
    position: 'left',
  },
  render: (args) => (
    <div style={{ marginLeft: '150px' }}>
      <Tooltip {...args}>
        <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
          左方向
        </button>
      </Tooltip>
    </div>
  ),
}

/**
 * 右方向に表示
 */
export const Right: Story = {
  args: {
    content: '右に表示されます',
    position: 'right',
  },
  render: (args) => (
    <Tooltip {...args}>
      <button className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
        右方向
      </button>
    </Tooltip>
  ),
}

/**
 * 長いテキスト
 */
export const LongContent: Story = {
  args: {
    content:
      'これは長いツールチップテキストです。複数行にわたる説明文を表示することもできます。',
    position: 'bottom',
  },
  render: (args) => (
    <Tooltip {...args}>
      <span className="cursor-help text-blue-600 underline">
        長いツールチップを表示
      </span>
    </Tooltip>
  ),
}

/**
 * アイコンと組み合わせ
 */
export const WithIcon: Story = {
  args: {
    content: 'ヘルプ情報',
    position: 'top',
  },
  render: (args) => (
    <div style={{ marginTop: '50px' }}>
      <Tooltip {...args}>
        <span className="inline-flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-gray-200 text-sm text-gray-600">
          ?
        </span>
      </Tooltip>
    </div>
  ),
}

/**
 * 矢印付き吹き出し（border-shape）
 *
 * border-shape の shape() で吹き出し全体を1つの輪郭として宣言しているため、
 * box-shadow も矢印の三角部分まで追従する。Chrome / Edge 147+ 専用。
 */
export const WithArrowShadow: Story = {
  args: {
    content: 'box-shadow が矢印の形に追従します',
    position: 'top',
  },
  render: (args) => (
    <div style={{ marginTop: '80px' }}>
      <Tooltip {...args}>
        <button
          className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          style={{ boxShadow: '0 8px 16px -6px rgb(0 0 0 / 0.3)' }}
        >
          ホバーして影に注目
        </button>
      </Tooltip>
    </div>
  ),
}

/**
 * 全方向の比較
 */
export const AllPositions: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8" style={{ padding: '80px' }}>
      <Tooltip content="上に表示" position="top">
        <button className="rounded bg-blue-500 px-4 py-2 text-white">Top</button>
      </Tooltip>

      <div className="flex gap-16">
        <Tooltip content="左に表示" position="left">
          <button className="rounded bg-green-500 px-4 py-2 text-white">
            Left
          </button>
        </Tooltip>

        <Tooltip content="右に表示" position="right">
          <button className="rounded bg-purple-500 px-4 py-2 text-white">
            Right
          </button>
        </Tooltip>
      </div>

      <Tooltip content="下に表示" position="bottom">
        <button className="rounded bg-orange-500 px-4 py-2 text-white">
          Bottom
        </button>
      </Tooltip>
    </div>
  ),
}
