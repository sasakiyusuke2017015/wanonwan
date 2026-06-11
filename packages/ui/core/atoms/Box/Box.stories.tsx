import type { Meta, StoryObj } from '@storybook/react'

import { Box } from './Box'

const meta: Meta<typeof Box> = {
  title: 'レイアウト/Box',
  component: Box,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    p: {
      control: 'text',
      description: 'padding（数値はpx、文字列はそのまま）',
    },
    px: {
      control: 'text',
      description: 'padding-x (horizontal)',
    },
    py: {
      control: 'text',
      description: 'padding-y (vertical)',
    },
    m: {
      control: 'text',
      description: 'margin（数値はpx、文字列はそのまま）',
    },
    mx: {
      control: 'text',
      description: 'margin-x (horizontal)',
    },
    my: {
      control: 'text',
      description: 'margin-y (vertical)',
    },
    display: {
      control: 'select',
      options: ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'],
      description: 'display プロパティ',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'aside', 'main', 'nav', 'header', 'footer'],
      description: 'レンダリングする要素',
    },
  },
}

export default meta
type Story = StoryObj<typeof Box>

/**
 * デフォルトのBox
 */
export const Default: Story = {
  args: {
    p: 16,
    className: 'bg-blue-100 border border-blue-300',
    children: 'Box コンテンツ',
  },
}

/**
 * パディング指定
 */
export const WithPadding: Story = {
  render: () => (
    <div className="space-y-4">
      <Box p={8} className="bg-gray-100 border border-gray-300">
        p={8} (8px)
      </Box>
      <Box p={16} className="bg-gray-100 border border-gray-300">
        p={16} (16px)
      </Box>
      <Box p={24} className="bg-gray-100 border border-gray-300">
        p={24} (24px)
      </Box>
      <Box p="1rem" className="bg-gray-100 border border-gray-300">
        p="1rem"
      </Box>
    </div>
  ),
}

/**
 * 方向別パディング
 */
export const DirectionalPadding: Story = {
  render: () => (
    <div className="space-y-4">
      <Box px={32} py={8} className="bg-green-100 border border-green-300">
        px={32} py={8}
      </Box>
      <Box px={8} py={32} className="bg-blue-100 border border-blue-300">
        px={8} py={32}
      </Box>
    </div>
  ),
}

/**
 * マージン指定
 */
export const WithMargin: Story = {
  render: () => (
    <div className="bg-gray-50 p-4 border">
      <Box m={0} p={8} className="bg-red-100 border border-red-300">
        m={0}
      </Box>
      <Box m={16} p={8} className="bg-red-100 border border-red-300">
        m={16}
      </Box>
      <Box mx="auto" p={8} className="bg-red-100 border border-red-300 w-48">
        mx="auto"
      </Box>
    </div>
  ),
}

/**
 * display プロパティ
 */
export const DisplayModes: Story = {
  render: () => (
    <div className="space-y-4">
      <Box display="block" p={8} className="bg-purple-100 border border-purple-300">
        display="block"
      </Box>
      <Box display="inline-block" p={8} className="bg-purple-100 border border-purple-300">
        display="inline-block"
      </Box>
      <Box display="flex" p={8} className="bg-purple-100 border border-purple-300 gap-2">
        <span className="bg-purple-200 px-2">Flex</span>
        <span className="bg-purple-200 px-2">Child</span>
        <span className="bg-purple-200 px-2">Items</span>
      </Box>
    </div>
  ),
}

/**
 * 異なる要素としてレンダリング
 */
export const AsElement: Story = {
  render: () => (
    <div className="space-y-4">
      <Box as="section" p={16} className="bg-yellow-100 border border-yellow-300">
        &lt;section&gt; として表示
      </Box>
      <Box as="article" p={16} className="bg-orange-100 border border-orange-300">
        &lt;article&gt; として表示
      </Box>
      <Box as="aside" p={16} className="bg-pink-100 border border-pink-300">
        &lt;aside&gt; として表示
      </Box>
    </div>
  ),
}

/**
 * ネスト使用例
 */
export const Nested: Story = {
  render: () => (
    <Box p={24} className="bg-gray-100 border border-gray-300">
      外側のBox (p=24)
      <Box p={16} m={8} className="bg-white border border-gray-400">
        内側のBox (p=16, m=8)
        <Box p={8} m={4} className="bg-blue-50 border border-blue-300">
          さらに内側のBox (p=8, m=4)
        </Box>
      </Box>
    </Box>
  ),
}

/**
 * カード風レイアウト
 */
export const CardLayout: Story = {
  render: () => (
    <Box p={24} className="bg-white rounded-lg shadow-lg max-w-sm">
      <Box py={8} className="border-b border-gray-200">
        <h3 className="text-lg font-semibold">カードタイトル</h3>
      </Box>
      <Box py={16}>
        <p className="text-gray-600">
          Box コンポーネントを使用してカード風のレイアウトを構築できます。
          padding と margin を組み合わせて使用します。
        </p>
      </Box>
      <Box py={8} className="border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-800">詳細を見る →</button>
      </Box>
    </Box>
  ),
}

/**
 * グリッドレイアウト
 */
export const GridLayout: Story = {
  render: () => (
    <Box display="grid" p={16} className="gap-4 bg-gray-50" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <Box p={16} className="bg-indigo-100 border border-indigo-300 text-center">
        Item 1
      </Box>
      <Box p={16} className="bg-indigo-100 border border-indigo-300 text-center">
        Item 2
      </Box>
      <Box p={16} className="bg-indigo-100 border border-indigo-300 text-center">
        Item 3
      </Box>
      <Box p={16} className="bg-indigo-100 border border-indigo-300 text-center">
        Item 4
      </Box>
      <Box p={16} className="bg-indigo-100 border border-indigo-300 text-center">
        Item 5
      </Box>
      <Box p={16} className="bg-indigo-100 border border-indigo-300 text-center">
        Item 6
      </Box>
    </Box>
  ),
}
