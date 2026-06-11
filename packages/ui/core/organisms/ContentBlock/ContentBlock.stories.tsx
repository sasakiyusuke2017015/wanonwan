import React from 'react';

import { ContentBlock } from './ContentBlock';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ContentBlock> = {
  title: '表示/コンテンツ/ContentBlock',
  component: ContentBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'ブロックのタイトル',
    },
    loading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
    loadingMessage: {
      control: 'text',
      description: 'ローディング中のメッセージ',
    },
    loadingHeight: {
      control: 'text',
      description: 'ローディング時の高さ',
    },
    loadingIconName: {
      control: 'select',
      options: [
        'loading-half',
        'loading-dots',
        'loading-pulse',
        'loading-morph',
        'spinner',
      ],
      description: 'ローディングアイコンの種類',
    },
    loadingSize: {
      control: 'number',
      description: 'ローディングアイコンのサイズ',
    },
    loadingColor: {
      control: 'text',
      description: 'ローディングアイコンの色',
    },
    className: {
      control: 'text',
      description: '追加のCSSクラス',
    },
    titleClassName: {
      control: 'text',
      description: 'タイトル用の追加CSSクラス',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なContentBlock
export const Default: Story = {
  args: {
    title: 'コンテンツブロック',
    loading: false,
    children: React.createElement(
      'div',
      {},
      React.createElement('p', {}, 'これはコンテンツブロックの内容です。'),
      React.createElement(
        'p',
        {},
        'LoadingZoneと統合された再利用可能なコンテンツコンテナです。'
      )
    ),
  },
};

// タイトルなし
export const WithoutTitle: Story = {
  args: {
    loading: false,
    children: React.createElement(
      'div',
      {},
      React.createElement('p', {}, 'タイトルなしのコンテンツブロックです。')
    ),
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    title: 'データ読み込み中',
    loading: true,
    loadingMessage: 'データを読み込み中...',
    loadingHeight: '200px',
    children: React.createElement(
      'div',
      {},
      React.createElement('p', {}, 'この内容はローディング中は表示されません。')
    ),
  },
};

// カスタムローディングアイコン
export const CustomLoadingIcon: Story = {
  args: {
    title: 'カスタムアイコンローディング',
    loading: true,
    loadingMessage: 'カスタムアイコンで読み込み中...',
    loadingHeight: '250px',
    loadingIconName: 'loading-morph',
    loadingSize: 48,
    loadingColor: 'text-blue-600',
    children: React.createElement(
      'div',
      {},
      React.createElement('p', {}, 'この内容はローディング中は表示されません。')
    ),
  },
};

// 配下メンバー情報のサンプル(実際の使用例)
export const EmployeeInfo: Story = {
  args: {
    loading: false,
    className: 'mb-2',
    children: React.createElement(
      'div',
      {},
      React.createElement(
        'div',
        { className: 'flex items-center gap-4 mb-4' },
        React.createElement(
          'h2',
          { className: 'text-fluid-2xl font-bold text-gray-800' },
          '笹木 勇介'
        ),
        React.createElement(
          'span',
          { className: 'text-gray-500' },
          '(メンバー番号: 3149)'
        )
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700' },
        React.createElement(
          'div',
          {},
          '所属部署: ソリューションサービス本部 / 営業部, 自動化DX部 | 役職: TL'
        ),
        React.createElement('div', {}, '面談日: 2025/07/30'),
        React.createElement('div', {}, '追加面談候補者: 未設定(未設定)')
      )
    ),
  },
};

// カスタムスタイリング
export const CustomStyling: Story = {
  args: {
    title: 'カスタムスタイルブロック',
    loading: false,
    className: 'border-2 border-blue-300 bg-blue-50',
    titleClassName: 'text-blue-800 border-b border-blue-200 pb-2',
    children: React.createElement(
      'div',
      { className: 'text-blue-700' },
      React.createElement(
        'p',
        {},
        'カスタムスタイリングが適用されたコンテンツブロックです。'
      )
    ),
  },
};
