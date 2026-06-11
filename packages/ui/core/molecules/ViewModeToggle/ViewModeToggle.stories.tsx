import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { ViewModeToggle, type ViewModeOption } from './ViewModeToggle'

const meta: Meta<typeof ViewModeToggle> = {
  title: 'コントロール/ViewModeToggle',
  component: ViewModeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: '現在選択されているモード',
    },
    showLabel: {
      control: 'boolean',
      description: 'ラベルを常に表示するか',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'サイズ',
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'teal', 'dark'],
      description: 'バリアント（カラーテーマ）',
    },
  },
}

export default meta
type Story = StoryObj<typeof ViewModeToggle>

type ViewMode = 'table' | 'card'
type DisplayMode = 'list' | 'grid' | 'timeline'

const tableCardOptions: ViewModeOption<ViewMode>[] = [
  { value: 'table', label: 'テーブル', icon: 'list' },
  { value: 'card', label: 'カード', icon: 'dashboard' },
]

const displayOptions: ViewModeOption<DisplayMode>[] = [
  { value: 'list', label: 'リスト', icon: 'list' },
  { value: 'grid', label: 'グリッド', icon: 'dashboard' },
  { value: 'timeline', label: 'タイムライン', icon: 'calendar' },
]

/**
 * デフォルト（インタラクティブ）
 */
export const Default: Story = {
  render: () => {
    const Toggle = () => {
      const [mode, setMode] = useState<ViewMode>('table')
      return (
        <div className="space-y-4">
          <ViewModeToggle
            value={mode}
            onChange={setMode}
            options={tableCardOptions}
          />
          <div className="text-sm text-gray-500">
            選択中: <span className="font-semibold">{mode}</span>
          </div>
        </div>
      )
    }
    return <Toggle />
  },
}

/**
 * ラベル表示
 */
export const WithLabel: Story = {
  render: () => {
    const Toggle = () => {
      const [mode, setMode] = useState<ViewMode>('card')
      return (
        <ViewModeToggle
          value={mode}
          onChange={setMode}
          options={tableCardOptions}
          showLabel
        />
      )
    }
    return <Toggle />
  },
}

/**
 * サイズバリエーション
 */
export const Sizes: Story = {
  render: () => {
    const SizeToggle = ({ size }: { size: 'small' | 'medium' | 'large' }) => {
      const [mode, setMode] = useState<ViewMode>('table')
      return (
        <ViewModeToggle
          value={mode}
          onChange={setMode}
          options={tableCardOptions}
          size={size}
          showLabel
        />
      )
    }
    return (
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-semibold">Small</p>
          <SizeToggle size="small" />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Medium (default)</p>
          <SizeToggle size="medium" />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Large</p>
          <SizeToggle size="large" />
        </div>
      </div>
    )
  },
}

/**
 * バリアントカラー（全variant比較）
 */
export const Variants: Story = {
  render: () => {
    const VariantToggle = ({ variant, bg }: { variant: 'default' | 'primary' | 'teal' | 'dark'; bg?: string }) => {
      const [mode, setMode] = useState<ViewMode>('table')
      return (
        <div className="rounded-lg p-4" style={{ backgroundColor: bg }}>
          <ViewModeToggle
            value={mode}
            onChange={setMode}
            options={tableCardOptions}
            variant={variant}
            showLabel
          />
        </div>
      )
    }
    return (
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-semibold">Default</p>
          <VariantToggle variant="default" />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Primary</p>
          <VariantToggle variant="primary" />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Teal</p>
          <VariantToggle variant="teal" />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-white">Dark</p>
          <VariantToggle variant="dark" bg="#1a1a2e" />
        </div>
      </div>
    )
  },
}

/**
 * Dark variant（ダークテーマ向け）
 */
export const Dark: Story = {
  render: () => {
    const Toggle = () => {
      const [mode, setMode] = useState<ViewMode>('table')
      return (
        <div className="rounded-xl p-8" style={{ backgroundColor: '#1a1a2e' }}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>表示切替</span>
              <ViewModeToggle
                value={mode}
                onChange={setMode}
                options={tableCardOptions}
                variant="dark"
                size="small"
              />
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              選択中: <span style={{ color: 'rgba(255,255,255,0.9)' }}>{mode === 'table' ? 'テーブル' : 'カード'}</span>
            </div>
          </div>
        </div>
      )
    }
    return <Toggle />
  },
}

/**
 * Dark variant + 3オプション
 */
export const DarkThreeOptions: Story = {
  render: () => {
    const Toggle = () => {
      const [mode, setMode] = useState<DisplayMode>('list')
      return (
        <div className="rounded-xl p-8" style={{ backgroundColor: '#1a1a2e' }}>
          <ViewModeToggle
            value={mode}
            onChange={setMode}
            options={displayOptions}
            variant="dark"
            showLabel
          />
        </div>
      )
    }
    return <Toggle />
  },
}

/**
 * 3つ以上の選択肢
 */
export const ThreeOptions: Story = {
  render: () => {
    const Toggle = () => {
      const [mode, setMode] = useState<DisplayMode>('list')
      return (
        <div className="space-y-4">
          <ViewModeToggle
            value={mode}
            onChange={setMode}
            options={displayOptions}
            showLabel
          />
          <div className="text-sm text-gray-500">
            選択中: <span className="font-semibold">{mode}</span>
          </div>
        </div>
      )
    }
    return <Toggle />
  },
}

/**
 * アイコンのみ（コンパクト）
 */
export const IconOnly: Story = {
  render: () => {
    const Toggle = () => {
      const [mode, setMode] = useState<ViewMode>('table')
      return (
        <ViewModeToggle
          value={mode}
          onChange={setMode}
          options={tableCardOptions}
          showLabel={false}
        />
      )
    }
    return <Toggle />
  },
}

/**
 * 実践例：ヘッダーバー内
 */
export const InHeaderBar: Story = {
  render: () => {
    const Example = () => {
      const [mode, setMode] = useState<ViewMode>('table')
      return (
        <div className="flex items-center justify-between rounded-lg bg-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold">データ一覧</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">表示切替:</span>
            <ViewModeToggle
              value={mode}
              onChange={setMode}
              options={tableCardOptions}
              size="small"
            />
          </div>
        </div>
      )
    }
    return <Example />
  },
}

/**
 * 実践例：ダークサイドバー
 */
export const InDarkSidebar: Story = {
  render: () => {
    const Example = () => {
      const [mode, setMode] = useState<ViewMode>('table')
      return (
        <div className="w-52 rounded-lg p-4" style={{ backgroundColor: '#16161e', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>#42 / 509</span>
            <ViewModeToggle
              value={mode}
              onChange={setMode}
              options={tableCardOptions}
              variant="dark"
              size="small"
            />
          </div>
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        </div>
      )
    }
    return <Example />
  },
}
