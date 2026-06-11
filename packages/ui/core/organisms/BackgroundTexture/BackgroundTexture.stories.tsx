import type { Meta, StoryObj } from '@storybook/react'

import { BackgroundTexture } from './BackgroundTexture'
import type { BackgroundTheme } from '../../constants/design'

const meta: Meta<typeof BackgroundTexture> = {
  title: '背景効果/BackgroundTexture',
  component: BackgroundTexture,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['wood', 'flooring', 'fabric', 'concrete', 'leather', 'marble', 'cream', 'lavender', 'sky'],
      description: '背景テーマ',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '400px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BackgroundTexture>

/**
 * 木目テクスチャ
 */
export const Wood: Story = {
  args: {
    theme: 'wood',
  },
}

/**
 * フローリング
 */
export const Flooring: Story = {
  args: {
    theme: 'flooring',
  },
}

/**
 * 布テクスチャ
 */
export const Fabric: Story = {
  args: {
    theme: 'fabric',
  },
}

/**
 * タイルパターン
 */
export const Concrete: Story = {
  args: {
    theme: 'concrete',
  },
}

/**
 * 紙テクスチャ
 */
export const Leather: Story = {
  args: {
    theme: 'leather',
  },
}

/**
 * ミント（単色）
 */
export const Marble: Story = {
  args: {
    theme: 'marble',
  },
}

/**
 * クリーム（単色）
 */
export const Cream: Story = {
  args: {
    theme: 'cream',
  },
}

/**
 * ラベンダー（単色）
 */
export const Lavender: Story = {
  args: {
    theme: 'lavender',
  },
}

/**
 * スカイ（単色）
 */
export const Sky: Story = {
  args: {
    theme: 'sky',
  },
}

/**
 * 全テーマ一覧
 */
export const AllThemes: Story = {
  render: () => {
    const themes: BackgroundTheme[] = [
      'wood',
      'flooring',
      'fabric',
      'concrete',
      'leather',
      'marble',
      'cream',
      'lavender',
      'sky',
    ]
    const labels: Record<BackgroundTheme, string> = {
      wood: '木目',
      flooring: 'フロア',
      fabric: '布',
      concrete: 'タイル',
      leather: '紙',
      marble: 'ミント',
      cream: 'クリーム',
      lavender: 'ラベンダー',
      sky: 'スカイ',
    }

    return (
      <div className="grid grid-cols-3 gap-0" style={{ height: '600px' }}>
        {themes.map((theme) => (
          <div key={theme} className="relative h-[200px]">
            <BackgroundTexture theme={theme} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-lg bg-white/80 px-4 py-2 text-sm font-medium shadow">
                {labels[theme]}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  },
  decorators: [(Story) => <Story />],
}

/**
 * コンテンツと組み合わせ
 */
export const WithContent: Story = {
  args: {
    theme: 'wood',
  },
  render: (args) => (
    <div className="relative h-[500px] w-full">
      <BackgroundTexture {...args} />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="max-w-md rounded-xl bg-white/90 p-8 text-center shadow-xl backdrop-blur">
          <h2 className="text-2xl font-bold text-gray-800">背景テクスチャ</h2>
          <p className="mt-4 text-gray-600">
            アプリケーション全体に統一感のある背景テクスチャを適用できます。
            テーマを切り替えることで、異なる雰囲気を演出できます。
          </p>
        </div>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * ダッシュボード風レイアウト
 */
export const DashboardLayout: Story = {
  args: {
    theme: 'fabric',
  },
  render: (args) => (
    <div className="relative min-h-[600px] w-full">
      <BackgroundTexture {...args} />
      <div className="relative z-10 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">ダッシュボード</h1>
        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-xl bg-white/90 p-6 shadow-lg backdrop-blur">
            <h3 className="text-lg font-semibold text-gray-800">カード 1</h3>
            <p className="mt-2 text-gray-600">コンテンツ</p>
          </div>
          <div className="rounded-xl bg-white/90 p-6 shadow-lg backdrop-blur">
            <h3 className="text-lg font-semibold text-gray-800">カード 2</h3>
            <p className="mt-2 text-gray-600">コンテンツ</p>
          </div>
          <div className="rounded-xl bg-white/90 p-6 shadow-lg backdrop-blur">
            <h3 className="text-lg font-semibold text-gray-800">カード 3</h3>
            <p className="mt-2 text-gray-600">コンテンツ</p>
          </div>
        </div>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}

/**
 * テクスチャ vs 単色の比較
 */
export const TextureVsSolid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-0" style={{ height: '400px' }}>
      <div className="relative border-r">
        <BackgroundTexture theme="wood" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mb-4 rounded bg-white/80 px-3 py-1 text-sm font-medium">
            テクスチャ（木目）
          </span>
          <div className="w-64 rounded-lg bg-white/90 p-4 shadow-lg">
            <h4 className="font-semibold">テクスチャ背景</h4>
            <p className="mt-2 text-sm text-gray-600">
              質感があり、温かみのある印象を与えます
            </p>
          </div>
        </div>
      </div>
      <div className="relative">
        <BackgroundTexture theme="cream" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mb-4 rounded bg-white/80 px-3 py-1 text-sm font-medium">
            単色（クリーム）
          </span>
          <div className="w-64 rounded-lg bg-white/90 p-4 shadow-lg">
            <h4 className="font-semibold">単色背景</h4>
            <p className="mt-2 text-sm text-gray-600">
              シンプルでクリーンな印象を与えます
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  decorators: [(Story) => <Story />],
}
