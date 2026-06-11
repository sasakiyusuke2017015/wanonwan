import type { Meta, StoryObj } from '@storybook/react'

import { Text } from './Text'

const meta: Meta<typeof Text> = {
  title: 'タイポグラフィ/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'テキストサイズ',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'フォントウェイト',
    },
    align: {
      control: 'radio',
      options: ['left', 'center', 'right'],
      description: 'テキスト配置',
    },
    color: {
      control: 'text',
      description: '色（Tailwind色名 or カラーコード）',
    },
    truncate: {
      control: 'boolean',
      description: '切り詰め有効',
    },
    as: {
      control: 'select',
      options: ['span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'div'],
      description: 'レンダリングする要素',
    },
  },
}

export default meta
type Story = StoryObj<typeof Text>

/**
 * デフォルト
 */
export const Default: Story = {
  args: {
    children: 'これはテキストコンポーネントです',
    size: 'base',
    weight: 'normal',
  },
}

/**
 * サイズバリエーション
 */
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Text size="xs">size="xs" - 極小テキスト</Text>
      </div>
      <div>
        <Text size="sm">size="sm" - 小さいテキスト</Text>
      </div>
      <div>
        <Text size="base">size="base" - 基本テキスト</Text>
      </div>
      <div>
        <Text size="lg">size="lg" - 大きいテキスト</Text>
      </div>
      <div>
        <Text size="xl">size="xl" - 特大テキスト</Text>
      </div>
      <div>
        <Text size="2xl">size="2xl" - 見出しレベル</Text>
      </div>
      <div>
        <Text size="3xl">size="3xl" - 大見出し</Text>
      </div>
      <div>
        <Text size="4xl">size="4xl" - 最大見出し</Text>
      </div>
    </div>
  ),
}

/**
 * ウェイトバリエーション
 */
export const Weights: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Text weight="normal">weight="normal" - 通常のテキスト</Text>
      </div>
      <div>
        <Text weight="medium">weight="medium" - ミディアム</Text>
      </div>
      <div>
        <Text weight="semibold">weight="semibold" - セミボールド</Text>
      </div>
      <div>
        <Text weight="bold">weight="bold" - ボールド</Text>
      </div>
    </div>
  ),
}

/**
 * 配置バリエーション
 */
export const Alignment: Story = {
  render: () => (
    <div className="w-80 space-y-4 border p-4">
      <Text as="p" align="left">
        align="left" - 左寄せテキスト
      </Text>
      <Text as="p" align="center">
        align="center" - 中央寄せテキスト
      </Text>
      <Text as="p" align="right">
        align="right" - 右寄せテキスト
      </Text>
    </div>
  ),
}

/**
 * カラーバリエーション
 */
export const Colors: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Text color="gray-800">color="gray-800" - グレー</Text>
      </div>
      <div>
        <Text color="blue-600">color="blue-600" - ブルー</Text>
      </div>
      <div>
        <Text color="green-600">color="green-600" - グリーン</Text>
      </div>
      <div>
        <Text color="red-600">color="red-600" - レッド</Text>
      </div>
      <div>
        <Text color="#ff6600">color="#ff6600" - カスタムHEX</Text>
      </div>
      <div>
        <Text color="rgb(138, 43, 226)">color="rgb(138, 43, 226)" - RGB</Text>
      </div>
    </div>
  ),
}

/**
 * 切り詰め
 */
export const Truncate: Story = {
  render: () => (
    <div className="w-60 space-y-4">
      <div className="border p-2">
        <Text truncate className="block">
          これは非常に長いテキストで、コンテナの幅を超えると切り詰められます
        </Text>
      </div>
      <div className="border p-2">
        <Text className="block">これは通常のテキストで、折り返されます。これは非常に長いテキストです。</Text>
      </div>
    </div>
  ),
}

/**
 * 要素の指定
 */
export const AsElements: Story = {
  render: () => (
    <div className="space-y-4">
      <Text as="h1" size="4xl" weight="bold">
        h1見出し
      </Text>
      <Text as="h2" size="3xl" weight="semibold">
        h2見出し
      </Text>
      <Text as="h3" size="2xl" weight="semibold">
        h3見出し
      </Text>
      <Text as="p" size="base">
        段落テキスト（p要素）
      </Text>
      <Text as="label" size="sm" weight="medium">
        ラベルテキスト
      </Text>
    </div>
  ),
}

/**
 * 組み合わせ例
 */
export const Combinations: Story = {
  render: () => (
    <div className="max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg">
      <Text as="h2" size="2xl" weight="bold" color="gray-800">
        記事タイトル
      </Text>
      <Text as="p" size="sm" color="gray-500">
        2024年1月15日 · 5分で読めます
      </Text>
      <Text as="p" size="base" color="gray-700">
        これは記事の本文です。Textコンポーネントを使用することで、
        一貫したタイポグラフィを実現できます。サイズ、ウェイト、
        色を簡潔に指定できます。
      </Text>
      <Text as="p" size="sm" color="blue-600" weight="medium">
        続きを読む →
      </Text>
    </div>
  ),
}

/**
 * プロフィールカード例
 */
export const ProfileCard: Story = {
  render: () => (
    <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
      <div>
        <Text as="h3" size="lg" weight="semibold" color="gray-800">
          田中 太郎
        </Text>
        <Text as="p" size="sm" color="gray-500">
          ソフトウェアエンジニア
        </Text>
        <Text as="p" size="xs" color="blue-600">
          @tanaka_taro
        </Text>
      </div>
    </div>
  ),
}

/**
 * 統計表示例
 */
export const Statistics: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="text-center">
        <Text as="div" size="4xl" weight="bold" color="blue-600">
          1,234
        </Text>
        <Text as="p" size="sm" color="gray-500">
          ユーザー
        </Text>
      </div>
      <div className="text-center">
        <Text as="div" size="4xl" weight="bold" color="green-600">
          567
        </Text>
        <Text as="p" size="sm" color="gray-500">
          プロジェクト
        </Text>
      </div>
      <div className="text-center">
        <Text as="div" size="4xl" weight="bold" color="purple-600">
          89%
        </Text>
        <Text as="p" size="sm" color="gray-500">
          達成率
        </Text>
      </div>
    </div>
  ),
}
