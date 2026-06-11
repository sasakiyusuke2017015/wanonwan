import type { Meta, StoryObj } from '@storybook/react'

import { Stack } from './Stack'

const meta: Meta<typeof Stack> = {
  title: 'レイアウト/Stack',
  component: Stack,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'radio',
      options: ['row', 'column'],
      description: 'スタックの方向',
    },
    gap: {
      control: 'text',
      description: '要素間の間隔（数値はpx、文字列はそのまま）',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'align-items',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      description: 'justify-content',
    },
    wrap: {
      control: 'boolean',
      description: 'flex-wrap を有効にする',
    },
  },
}

export default meta
type Story = StoryObj<typeof Stack>

const DemoBox = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-blue-100 border border-blue-300 px-4 py-2 ${className}`}>{children}</div>
)

/**
 * デフォルト（縦方向）
 */
export const Default: Story = {
  args: {
    direction: 'column',
    gap: 8,
  },
  render: (args) => (
    <Stack {...args}>
      <DemoBox>Item 1</DemoBox>
      <DemoBox>Item 2</DemoBox>
      <DemoBox>Item 3</DemoBox>
    </Stack>
  ),
}

/**
 * 横方向（Row）
 */
export const Row: Story = {
  args: {
    direction: 'row',
    gap: 16,
  },
  render: (args) => (
    <Stack {...args}>
      <DemoBox>Item 1</DemoBox>
      <DemoBox>Item 2</DemoBox>
      <DemoBox>Item 3</DemoBox>
    </Stack>
  ),
}

/**
 * ギャップの比較
 */
export const GapComparison: Story = {
  render: () => (
    <Stack direction="column" gap={24}>
      <div>
        <p className="mb-2 text-sm font-semibold">gap=4</p>
        <Stack direction="row" gap={4}>
          <DemoBox>A</DemoBox>
          <DemoBox>B</DemoBox>
          <DemoBox>C</DemoBox>
        </Stack>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">gap=16</p>
        <Stack direction="row" gap={16}>
          <DemoBox>A</DemoBox>
          <DemoBox>B</DemoBox>
          <DemoBox>C</DemoBox>
        </Stack>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">gap=32</p>
        <Stack direction="row" gap={32}>
          <DemoBox>A</DemoBox>
          <DemoBox>B</DemoBox>
          <DemoBox>C</DemoBox>
        </Stack>
      </div>
    </Stack>
  ),
}

/**
 * align-items のバリエーション
 */
export const AlignItems: Story = {
  render: () => (
    <Stack direction="column" gap={24}>
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
        <div key={align}>
          <p className="mb-2 text-sm font-semibold">align="{align}"</p>
          <Stack
            direction="row"
            gap={8}
            align={align}
            className="bg-gray-50 p-4 min-h-[80px] border"
          >
            <DemoBox className="h-8">Short</DemoBox>
            <DemoBox className="h-16">Tall</DemoBox>
            <DemoBox className="h-10">Medium</DemoBox>
          </Stack>
        </div>
      ))}
    </Stack>
  ),
}

/**
 * justify-content のバリエーション
 */
export const JustifyContent: Story = {
  render: () => (
    <Stack direction="column" gap={24}>
      {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((justify) => (
        <div key={justify}>
          <p className="mb-2 text-sm font-semibold">justify="{justify}"</p>
          <Stack
            direction="row"
            gap={8}
            justify={justify}
            className="bg-gray-50 p-4 w-96 border"
          >
            <DemoBox>A</DemoBox>
            <DemoBox>B</DemoBox>
            <DemoBox>C</DemoBox>
          </Stack>
        </div>
      ))}
    </Stack>
  ),
}

/**
 * wrap有効
 */
export const WithWrap: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <Stack direction="row" gap={8} wrap>
        <DemoBox>Item 1</DemoBox>
        <DemoBox>Item 2</DemoBox>
        <DemoBox>Item 3</DemoBox>
        <DemoBox>Item 4</DemoBox>
        <DemoBox>Item 5</DemoBox>
        <DemoBox>Item 6</DemoBox>
        <DemoBox>Item 7</DemoBox>
        <DemoBox>Item 8</DemoBox>
      </Stack>
    </div>
  ),
}

/**
 * ネスト使用例
 */
export const Nested: Story = {
  render: () => (
    <Stack direction="column" gap={16} className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold">メインコンテナ</h3>
      <Stack direction="row" gap={16}>
        <Stack direction="column" gap={8} className="bg-white p-4 rounded">
          <DemoBox>Left 1</DemoBox>
          <DemoBox>Left 2</DemoBox>
        </Stack>
        <Stack direction="column" gap={8} className="bg-white p-4 rounded flex-1">
          <DemoBox>Center 1</DemoBox>
          <DemoBox>Center 2</DemoBox>
          <DemoBox>Center 3</DemoBox>
        </Stack>
        <Stack direction="column" gap={8} className="bg-white p-4 rounded">
          <DemoBox>Right 1</DemoBox>
          <DemoBox>Right 2</DemoBox>
        </Stack>
      </Stack>
    </Stack>
  ),
}

/**
 * フォームレイアウト例
 */
export const FormLayout: Story = {
  render: () => (
    <Stack direction="column" gap={16} className="w-80 p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">ログイン</h3>
      <Stack direction="column" gap={4}>
        <label className="text-sm font-medium">メールアドレス</label>
        <input
          type="email"
          className="border rounded px-3 py-2"
          placeholder="email@example.com"
        />
      </Stack>
      <Stack direction="column" gap={4}>
        <label className="text-sm font-medium">パスワード</label>
        <input type="password" className="border rounded px-3 py-2" placeholder="********" />
      </Stack>
      <Stack direction="row" gap={8} justify="end">
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">キャンセル</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          ログイン
        </button>
      </Stack>
    </Stack>
  ),
}

/**
 * ヘッダーレイアウト例
 */
export const HeaderLayout: Story = {
  render: () => (
    <Stack
      direction="row"
      align="center"
      justify="between"
      className="w-full max-w-2xl bg-white p-4 shadow rounded-lg"
    >
      <Stack direction="row" align="center" gap={8}>
        <div className="w-10 h-10 bg-blue-500 rounded-full" />
        <span className="font-semibold">ロゴ</span>
      </Stack>
      <Stack direction="row" gap={16}>
        <a href="#" className="text-gray-600 hover:text-gray-900">
          ホーム
        </a>
        <a href="#" className="text-gray-600 hover:text-gray-900">
          機能
        </a>
        <a href="#" className="text-gray-600 hover:text-gray-900">
          料金
        </a>
      </Stack>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        お問い合わせ
      </button>
    </Stack>
  ),
}
