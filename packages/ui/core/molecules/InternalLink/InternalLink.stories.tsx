import { InternalLink } from './InternalLink';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof InternalLink> = {
  title: 'ナビゲーション/リンク/InternalLink',
  component: InternalLink,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
React Router用の内部リンクコンポーネント。

3つのバリアント(button、text、link)と複数のサイズ・色をサポートします。
テーブル内や一般的なUI要素として使用可能です。
        `.trim(),
      },
    },
  },
  argTypes: {
    to: {
      description: 'React Routerのリンク先パス',
      control: 'text',
    },
    children: {
      description: 'リンクテキスト',
      control: 'text',
    },
    variant: {
      description: 'リンクの表示スタイル',
      control: 'select',
      options: ['button', 'text', 'link'],
    },
    size: {
      description: 'リンクのサイズ',
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      description: 'リンクの色',
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger'],
    },
    disabled: {
      description: 'リンクの無効化',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InternalLink>;

// 基本的なリンク
export const Default: Story = {
  args: {
    to: '/dashboard',
    children: 'ダッシュボードへ',
  },
};

// ボタン風リンク
export const ButtonVariant: Story = {
  args: {
    to: '/profile',
    children: 'プロフィール編集',
    variant: 'button',
    color: 'primary',
    size: 'medium',
  },
};

// テキストリンク
export const TextVariant: Story = {
  args: {
    to: '/settings',
    children: '設定を変更',
    variant: 'text',
    color: 'secondary',
    size: 'medium',
  },
};

// サイズバリエーション
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">リンクスタイル</h3>
        <div className="flex items-center space-x-4">
          <InternalLink to="/small" size="small">
            小さいリンク
          </InternalLink>
          <InternalLink to="/medium" size="medium">
            中サイズリンク
          </InternalLink>
          <InternalLink to="/large" size="large">
            大きいリンク
          </InternalLink>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">ボタンスタイル</h3>
        <div className="flex items-center space-x-4">
          <InternalLink to="/small" variant="button" size="small">
            小ボタン
          </InternalLink>
          <InternalLink to="/medium" variant="button" size="medium">
            中ボタン
          </InternalLink>
          <InternalLink to="/large" variant="button" size="large">
            大ボタン
          </InternalLink>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">テキストスタイル</h3>
        <div className="flex items-center space-x-4">
          <InternalLink to="/small" variant="text" size="small">
            小テキスト
          </InternalLink>
          <InternalLink to="/medium" variant="text" size="medium">
            中テキスト
          </InternalLink>
          <InternalLink to="/large" variant="text" size="large">
            大テキスト
          </InternalLink>
        </div>
      </div>
    </div>
  ),
};

// 色バリエーション
export const Colors: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">リンクスタイル</h3>
        <div className="flex flex-wrap gap-4">
          <InternalLink to="/primary" color="primary">
            Primary
          </InternalLink>
          <InternalLink to="/secondary" color="secondary">
            Secondary
          </InternalLink>
          <InternalLink to="/success" color="success">
            Success
          </InternalLink>
          <InternalLink to="/warning" color="warning">
            Warning
          </InternalLink>
          <InternalLink to="/danger" color="danger">
            Danger
          </InternalLink>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">ボタンスタイル</h3>
        <div className="flex flex-wrap gap-4">
          <InternalLink to="/primary" variant="button" color="primary">
            Primary
          </InternalLink>
          <InternalLink to="/secondary" variant="button" color="secondary">
            Secondary
          </InternalLink>
          <InternalLink to="/success" variant="button" color="success">
            Success
          </InternalLink>
          <InternalLink to="/warning" variant="button" color="warning">
            Warning
          </InternalLink>
          <InternalLink to="/danger" variant="button" color="danger">
            Danger
          </InternalLink>
        </div>
      </div>
    </div>
  ),
};

// 無効状態
export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">無効化されたリンク</h3>
        <div className="flex flex-wrap gap-4">
          <InternalLink to="/disabled" disabled>
            無効なリンク
          </InternalLink>
          <InternalLink to="/disabled" variant="button" disabled>
            無効なボタン
          </InternalLink>
          <InternalLink to="/disabled" variant="text" disabled>
            無効なテキスト
          </InternalLink>
        </div>
      </div>
    </div>
  ),
};

// アンダーバー付きリンク
export const With: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">アンダーバー付きリンク</h3>
        <div className="flex flex-wrap gap-4">
          <InternalLink to="/link1">
            常にアンダーライン表示
          </InternalLink>
          <InternalLink to="/link2" variant="text" color="success">
            テキストリンク(緑・下線付き)
          </InternalLink>
          <InternalLink to="/link3" color="danger" size="large">
            大サイズ(赤・下線付き)
          </InternalLink>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-fluid-lg font-semibold">比較：通常とアンダーバー付き</h3>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-md mb-2 font-medium">通常(ホバー時のみ下線)</h4>
            <div className="space-y-2">
              <InternalLink to="/normal1">通常のリンク</InternalLink>
              <br />
              <InternalLink to="/normal2" variant="text" color="secondary">
                テキストリンク
              </InternalLink>
              <br />
              <InternalLink to="/normal3" color="success">
                緑のリンク
              </InternalLink>
            </div>
          </div>
          <div>
            <h4 className="text-md mb-2 font-medium">
              アンダーバー付き(常に下線)
            </h4>
            <div className="space-y-2">
              <InternalLink to="/1">
                アンダーバー付きリンク
              </InternalLink>
              <br />
              <InternalLink
                to="/2"
                variant="text"
                color="secondary"

              >
                テキストリンク
              </InternalLink>
              <br />
              <InternalLink to="/3" color="success">
                緑のリンク
              </InternalLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// テーブル内での使用例
export const TableUsage: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-fluid-lg font-semibold">テーブル内での使用例</h3>
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">メンバーID</th>
            <th className="border border-gray-300 px-4 py-2">氏名</th>
            <th className="border border-gray-300 px-4 py-2">部署</th>
            <th className="border border-gray-300 px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">001</td>
            <td className="border border-gray-300 px-4 py-2">
              <InternalLink
                to="/employee/001"
                variant="text"
                color="primary"

              >
                田中太郎
              </InternalLink>
            </td>
            <td className="border border-gray-300 px-4 py-2">営業部</td>
            <td className="border border-gray-300 px-4 py-2">
              <InternalLink
                to="/employee/001/edit"
                variant="button"
                size="small"
                color="secondary"
              >
                編集
              </InternalLink>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">002</td>
            <td className="border border-gray-300 px-4 py-2">
              <InternalLink
                to="/employee/002"
                variant="text"
                color="primary"

              >
                佐藤花子
              </InternalLink>
            </td>
            <td className="border border-gray-300 px-4 py-2">人事部</td>
            <td className="border border-gray-300 px-4 py-2">
              <InternalLink
                to="/employee/002/edit"
                variant="button"
                size="small"
                color="secondary"
              >
                編集
              </InternalLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
