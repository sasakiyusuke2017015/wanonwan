import { useState, type ComponentProps } from 'react';

import { FixedTabBar } from './FixedTabBar';

type FixedTabBarProps = ComponentProps<typeof FixedTabBar>;

/**
 * 固定位置タブバーコンポーネント
 *
 * SubHeaderと同じ位置に固定表示されるタブバー。
 * 左ペインの開閉状態に応じて位置が自動調整されます。
 */
export default {
  title: 'ナビゲーション/タブ/FixedTabBar',
  component: FixedTabBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
FixedTabBarコンポーネント。以下の機能をサポート:

- **固定位置**: SubHeaderと同じ高さに固定表示
- **レスポンシブ**: 左ペインの開閉に応じて自動調整
- **高さ自動計算**: CSS変数として高さを設定
- **カスタマイズ可能**: borderRadiusなどのスタイルをpropsで制御

ページ内でタブ切り替えが必要な場面に使用します。
        `,
      },
    },
  },
  argTypes: {
    isLeftPaneOpen: {
      control: { type: 'boolean' },
      description: '左ペインが開いているか',
      table: { defaultValue: { summary: false } },
    },
    tabBorderRadius: {
      control: { type: 'text' },
      description: 'タブの角丸設定',
      table: { defaultValue: { summary: '0.5rem' } },
    },
    className: {
      control: { type: 'text' },
      description: 'カスタムクラス名',
    },
  },
};

// 基本的な使用例
export const Basic = {
  args: {
    isLeftPaneOpen: false,
  },
  render: (args: FixedTabBarProps) => (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed left-0 right-0 top-0 z-30 h-16 bg-blue-600 shadow-md">
        <div className="flex h-full items-center px-6">
          <h1 className="text-fluid-xl font-bold text-white">メインヘッダー</h1>
        </div>
      </div>
      <FixedTabBar {...args}>
        <div className="flex gap-4 bg-white p-4">
          <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            タブ1
          </button>
          <button className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            タブ2
          </button>
          <button className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            タブ3
          </button>
        </div>
      </FixedTabBar>
      <div className="pt-32 px-6">
        <p className="text-gray-700">メインコンテンツがここに表示されます。</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '基本的なFixedTabBar。ヘッダーの下に固定表示されます。',
      },
    },
  },
};

// 左ペイン連動デモ
const LeftPaneDemo = (args: FixedTabBarProps) => {
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="fixed left-0 right-0 top-0 z-30 h-16 bg-blue-600 shadow-md">
        <div className="flex h-full items-center justify-between px-6">
          <h1 className="text-fluid-xl font-bold text-white">メインヘッダー</h1>
          <button
            onClick={() => setIsLeftPaneOpen(!isLeftPaneOpen)}
            className="rounded-lg bg-white/20 px-4 py-2 text-white hover:bg-white/30"
          >
            {isLeftPaneOpen ? '左ペインを閉じる' : '左ペインを開く'}
          </button>
        </div>
      </div>

      {/* 左ペイン */}
      {isLeftPaneOpen && (
        <div className="fixed left-0 top-16 z-20 h-full w-64 bg-gray-800 shadow-lg">
          <div className="p-4">
            <p className="text-white">左ペインコンテンツ</p>
          </div>
        </div>
      )}

      {/* 固定タブバー */}
      <FixedTabBar {...args} isLeftPaneOpen={isLeftPaneOpen}>
        <div className="flex gap-4 bg-white p-4">
          <button className="rounded-lg bg-teal-500 px-4 py-2 text-white hover:bg-teal-600">
            ダッシュボード
          </button>
          <button className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            レポート
          </button>
          <button className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            設定
          </button>
        </div>
      </FixedTabBar>

      {/* メインコンテンツ */}
      <div
        className="pt-32 px-6 transition-all duration-300"
        style={{
          marginLeft: isLeftPaneOpen ? '16rem' : '0',
        }}
      >
        <h2 className="mb-4 text-fluid-2xl font-bold text-gray-800">メインコンテンツ</h2>
        <p className="text-gray-700">
          左ペインの開閉に応じてタブバーの位置が自動調整されます。
        </p>
      </div>
    </div>
  );
};

export const WithLeftPane = {
  render: (args: FixedTabBarProps) => <LeftPaneDemo {...args} />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          '左ペインの開閉に連動するデモ。ボタンをクリックして動作を確認できます。',
      },
    },
  },
};

// カスタム角丸
export const CustomBorderRadius = {
  args: {
    isLeftPaneOpen: false,
    tabBorderRadius: '1.5rem',
  },
  render: (args: FixedTabBarProps) => (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed left-0 right-0 top-0 z-30 h-16 bg-purple-600 shadow-md">
        <div className="flex h-full items-center px-6">
          <h1 className="text-fluid-xl font-bold text-white">カスタムスタイル</h1>
        </div>
      </div>
      <FixedTabBar {...args}>
        <div className="flex gap-4 bg-white p-4">
          <button className="rounded-full bg-purple-500 px-6 py-2 text-white hover:bg-purple-600">
            Tab A
          </button>
          <button className="rounded-full bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300">
            Tab B
          </button>
          <button className="rounded-full bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300">
            Tab C
          </button>
        </div>
      </FixedTabBar>
      <div className="pt-32 px-6">
        <p className="text-gray-700">カスタム角丸（1.5rem）が適用されています。</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'tabBorderRadiusプロパティでタブバーの角丸をカスタマイズできます。',
      },
    },
  },
};

// 多数のタブ
export const ManyTabs = {
  args: {
    isLeftPaneOpen: false,
  },
  render: (args: FixedTabBarProps) => (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed left-0 right-0 top-0 z-30 h-16 bg-green-600 shadow-md">
        <div className="flex h-full items-center px-6">
          <h1 className="text-fluid-xl font-bold text-white">多数のタブ</h1>
        </div>
      </div>
      <FixedTabBar {...args}>
        <div className="flex gap-2 overflow-x-auto bg-white p-4">
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              className={`whitespace-nowrap rounded-lg px-4 py-2 ${
                i === 0
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              タブ {i + 1}
            </button>
          ))}
        </div>
      </FixedTabBar>
      <div className="pt-32 px-6">
        <p className="text-gray-700">多数のタブがある場合は横スクロール可能です。</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'タブが多い場合の表示例。横スクロールで対応できます。',
      },
    },
  },
};
