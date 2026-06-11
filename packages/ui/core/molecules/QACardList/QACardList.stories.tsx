import type { Meta, StoryObj } from '@storybook/react';

import { QACardList } from './QACardList';

const meta: Meta<typeof QACardList> = {
  title: '表示/カード/QACardList',
  component: QACardList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof QACardList>;

const sampleItems = [
  { question: '今日の業務で最も成果があったことは何ですか？', answer: 'プロジェクトの設計レビューを完了しました。' },
  { question: '改善したい点はありますか？', answer: 'コードレビューのスピードを上げたいです。' },
  { question: '明日の目標は？', answer: 'テストカバレッジを80%以上にする。' },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const BlueVariant: Story = {
  args: {
    items: sampleItems,
    variant: 'blue',
  },
};

export const WithInfoMessage: Story = {
  args: {
    items: sampleItems,
    infoMessage: '回答内容を確認してください。送信後の変更はできません。',
  },
};

export const WithAIComment: Story = {
  args: {
    items: sampleItems,
    aiComment: '全体的に具体的な目標が設定されており、良い振り返りです。明日のテストカバレッジ目標も明確ですね。',
  },
};
