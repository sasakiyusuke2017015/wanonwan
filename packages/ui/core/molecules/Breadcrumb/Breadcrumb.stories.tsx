// src/components/common/molecules/Breadcrumb.stories.tsx
import type { StoryFn } from '@storybook/react';

import { Breadcrumb } from './Breadcrumb';

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
    layout: 'padded',
  },
  argTypes: {
    items: {
      description: 'パンくずの項目（label, href, tooltip, size）',
      control: 'object',
    },
    separator: {
      description: 'セパレータ文字',
      control: 'text',
    },
    className: {
      description: 'カスタムクラス（breadcrumb-in-headerでヘッダー内スタイル）',
      control: 'text',
    },
    colorTheme: {
      description: 'カラーテーマ（現在は未使用）',
      control: 'text',
    },
    primaryContrastText: {
      description: 'プライマリコントラストテキスト色（ヘッダー内で使用）',
      control: 'color',
    },
  },
};

/**
 * デフォルトのパンくずリスト
 */
export const Default = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      { label: 'カテゴリ', href: '/category' },
      { label: '現在のページ', href: '/category/current' },
    ],
  },
};

/**
 * 2階層のパンくずリスト
 */
export const TwoLevels = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      { label: 'アンケート一覧', href: '/surveys' },
    ],
  },
};

/**
 * 深い階層のパンくずリスト
 */
export const DeepHierarchy = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      { label: 'カテゴリ1', href: '/category1' },
      { label: 'カテゴリ2', href: '/category1/category2' },
      { label: 'カテゴリ3', href: '/category1/category2/category3' },
      { label: '現在のページ', href: '/category1/category2/category3/current' },
    ],
  },
};

/**
 * ツールチップ付き
 */
export const WithTooltips = {
  args: {
    items: [
      { label: 'HOME', href: '/', tooltip: 'トップページに戻る' },
      {
        label: '配下メンバー一覧',
        href: '/employees',
        tooltip: '配下メンバーの一覧ページ',
      },
      {
        label: '田中太郎',
        href: '/employees/123',
        tooltip: '田中太郎さんの詳細ページ',
      },
    ],
  },
};

/**
 * カスタムセパレータ
 */
export const CustomSeparator = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      { label: 'カテゴリ', href: '/category' },
      { label: '現在のページ', href: '/category/current' },
    ],
    separator: '/',
  },
};

/**
 * ヘッダー内での表示（白色テーマ）
 */
export const InHeader = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      { label: 'アンケート一覧', href: '/surveys' },
      { label: 'アンケート回答', href: '/surveys/123' },
    ],
    className: 'breadcrumb-in-header',
  },
  decorators: [
    (Story: StoryFn) => (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <Story />
      </div>
    ),
  ],
};

/**
 * 長いラベル名
 */
export const LongLabels = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      {
        label: '非常に長いカテゴリ名が表示される場合のテスト',
        href: '/category',
      },
      {
        label: '現在の非常に長いページ名が表示される場合のテスト',
        href: '/category/current',
      },
    ],
  },
};

/**
 * 単一項目（HOMEのみ）
 */
export const SingleItem = {
  args: {
    items: [{ label: 'HOME', href: '/' }],
  },
};

/**
 * 実際の使用例：回答詳細
 */
export const EmployeeDetailExample = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      { label: '配下メンバー一覧', href: '/employees' },
      { label: '田中太郎', href: '/employees/123' },
    ],
  },
};

/**
 * 実際の使用例：アンケート回答
 */
export const SurveyInputExample = {
  args: {
    items: [
      { label: 'HOME', href: '/' },
      { label: 'アンケート一覧', href: '/surveys' },
      { label: '2024年度 メンバー満足度調査', href: '/surveys/456' },
    ],
  },
};

/**
 * 矢羽スタイル（border-shape, Chrome 147+ 専用）
 *
 * border-shape の shape() で矢羽形を要素の輪郭として宣言しているため、
 * 矢羽の三角部分が bounding box の中に完全に収まり、間隔は gap だけで完結する。
 * box-shadow も矢羽の輪郭に追従する。
 */
export const ChevronVariant = {
  args: {
    variant: 'chevron',
    items: [
      { label: 'HOME', href: '/' },
      { label: 'プロジェクト', href: '/projects' },
      { label: 'タスク詳細', href: '/projects/1/tasks/2' },
    ],
  },
};
