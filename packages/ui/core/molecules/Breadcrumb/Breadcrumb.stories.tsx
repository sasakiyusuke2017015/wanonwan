import type { StoryFn } from '@storybook/react';

import { Breadcrumb } from './Breadcrumb';

/**
 * パンくずナビゲーション (階層ナビの正準・presentational)
 *
 * pathname 解析・ラベル解決・省略ルールは呼び出し側 (apps) が持ち、
 * 本コンポーネントは items の href 有無で link / span を描き分けるだけ。
 */
export default {
  title: 'ナビゲーション/パンくず/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  decorators: [
    (Story: StoryFn) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
現行アプリの TopBar パンくずと同一デザインの presentational 部品。

- 先頭に \`isHome\` 項目を置くとホームアイコンで表示
- 末尾は現在ページとして \`aria-current="page"\` の span (href があっても link にしない)
- href の無い中間項目は span (動的 ID 等、404 link を作らない)
- Next.js では \`linkAs\` に \`next/link\` の Link を注入する
        `,
      },
    },
  },
};

const home = { key: 'home', label: '', href: '/dashboard', isHome: true };

// ダッシュボード (ホーム単独): アイコンのみ
export const HomeOnly = {
  render: () => <Breadcrumb items={[{ key: 'home', label: '', isHome: true }]} />,
};

// 通常の階層
export const Basic = {
  render: () => (
    <Breadcrumb
      items={[
        home,
        { key: 'seg-0', label: 'ユーザー管理', href: '/admin/users' },
        { key: 'seg-1', label: '編集' },
      ]}
    />
  ),
};

// 動的 ID を含む階層 (override で実体名 + link)
export const WithEntityOverride = {
  render: () => (
    <Breadcrumb
      items={[
        home,
        { key: 'seg-0', label: 'コース', href: '/my-courses' },
        { key: 'seg-1', label: 'AIリテラシー入門', href: '/my-courses/5' },
        { key: 'seg-2', label: '第1章' },
      ]}
    />
  ),
};

// href の無い中間項目 (span 表示)
export const WithUnlinkableSegment = {
  render: () => (
    <Breadcrumb
      items={[
        home,
        { key: 'seg-0', label: '問題バンク', href: '/questions' },
        { key: 'seg-1', label: '147' },
        { key: 'seg-2', label: 'プレビュー' },
      ]}
    />
  ),
};
