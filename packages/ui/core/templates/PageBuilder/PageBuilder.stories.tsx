/**
 * PageBuilder - ドラッグ＆ドロップ ページビルダー
 *
 * ui-catalog のコンポーネントをドラッグ＆ドロップで配置し、ページのラフを作成する
 */
import type { Meta, StoryObj } from '@storybook/react'
import { Puck, Render } from '@measured/puck'
import '@measured/puck/puck.css'

import { puckConfig } from './puckConfig'

const PageBuilderEditor = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Puck
        config={puckConfig}
        data={{ content: [], root: {} }}
        onPublish={(data) => {
          const json = JSON.stringify(data, null, 2)
          const blob = new Blob([json], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'page-layout.json'
          a.click()
          URL.revokeObjectURL(url)
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Templates/PageBuilder',
  component: PageBuilderEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'ui-catalog のコンポーネントをドラッグ＆ドロップで配置して、ページのラフを作成できます。「Publish」ボタンで JSON としてエクスポートできます。',
      },
    },
  },
} satisfies Meta<typeof PageBuilderEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Editor: Story = {
  name: 'エディタ',
}

const sampleData = {
  content: [
    {
      type: 'HeadingBlock' as const,
      props: { text: 'ダッシュボード', level: 'h1' as const, align: 'left' as const, id: 'heading-1' },
    },
    {
      type: 'BannerBlock' as const,
      props: { message: '新しいアップデートがあります', variant: 'info' as const, id: 'banner-1' },
    },
    {
      type: 'SpacerBlock' as const,
      props: { height: 16, id: 'spacer-1' },
    },
    {
      type: 'CardBlock' as const,
      props: {
        title: '売上サマリー',
        content: '今月の売上は前月比 120% です。',
        padding: true,
        id: 'card-1',
      },
    },
    {
      type: 'SpacerBlock' as const,
      props: { height: 16, id: 'spacer-2' },
    },
    {
      type: 'CardBlock' as const,
      props: {
        title: 'タスク一覧',
        content: '残りのタスクは 5件 です。',
        padding: true,
        id: 'card-2',
      },
    },
    {
      type: 'SpacerBlock' as const,
      props: { height: 24, id: 'spacer-3' },
    },
    {
      type: 'ButtonBlock' as const,
      props: { label: '詳細を見る', variant: 'primary' as const, size: 'medium' as const, fullWidth: false, id: 'button-1' },
    },
  ],
  root: {},
}

const SamplePage = () => (
  <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
    <Render config={puckConfig} data={sampleData} />
  </div>
)

export const SamplePreview: Story = {
  name: 'サンプルページ',
  render: () => <SamplePage />,
}
