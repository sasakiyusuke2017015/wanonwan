import type { Meta, StoryObj } from '@storybook/react';

import { MemberCard } from './MemberCard';
import type { MemberCardData } from './types';

const meta: Meta<typeof MemberCard> = {
  title: '表示/カード/MemberCard',
  component: MemberCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    selected: {
      control: 'boolean',
      description: '選択状態',
    },
    cardRadius: {
      control: 'text',
      description: 'カードの角丸',
    },
    cellRadius: {
      control: 'text',
      description: 'セル（スコアエリア）の角丸',
    },
    onSelectionChange: {
      action: 'onSelectionChange',
      description: '選択変更ハンドラ',
    },
    onClick: {
      action: 'onClick',
      description: 'カードクリックハンドラ',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MemberCard>;

const baseData: MemberCardData = {
  id: '1',
  name: '山田 太郎',
  subtitle: 'エンジニア部',
  scores: [
    { label: '技術', value: 4.2 },
    { label: 'コミュニケーション', value: 3.8 },
    { label: 'リーダーシップ', value: 3.0 },
  ],
  statuses: [
    {
      label: '進捗',
      value: 'active',
      definitions: {
        active: { shortLabel: '進行中', color: 'green' },
        pending: { shortLabel: '保留', color: 'yellow' },
        done: { shortLabel: '完了', color: 'blue' },
      },
      defaultLabel: '未設定',
    },
  ],
  dates: [
    { label: '開始日', value: '2025-04-01' },
    { label: '終了日', value: '2025-06-30' },
  ],
};

export const Default: Story = {
  args: {
    data: baseData,
    selected: false,
  },
  decorators: [(Story) => <div style={{ width: '280px' }}><Story /></div>],
};

export const Selected: Story = {
  name: '選択状態',
  args: {
    data: baseData,
    selected: true,
  },
  decorators: [(Story) => <div style={{ width: '280px' }}><Story /></div>],
};

export const WithAlert: Story = {
  name: 'アラート状態',
  args: {
    data: {
      ...baseData,
      id: '2',
      name: '佐藤 花子',
      isAlert: true,
      scores: [
        { label: '技術', value: 1.2 },
        { label: 'コミュニケーション', value: 1.5 },
        { label: 'リーダーシップ', value: 1.0 },
      ],
    },
    selected: false,
  },
  decorators: [(Story) => <div style={{ width: '280px' }}><Story /></div>],
};

export const WithBadgesAndMemo: Story = {
  name: 'バッジ・メモ付き',
  args: {
    data: {
      ...baseData,
      id: '3',
      name: '鈴木 一郎',
      badges: [
        { label: '形式', value: 'オンライン', color: 'blue' },
        { label: '優先度', value: '高', color: 'red' },
      ],
      memo: 'フォローアップが必要。来週までに再確認してください。',
    },
    selected: false,
  },
  decorators: [(Story) => <div style={{ width: '280px' }}><Story /></div>],
};

export const MinimalData: Story = {
  name: '最小データ',
  args: {
    data: {
      id: '4',
      name: '田中 次郎',
    },
    selected: false,
  },
  decorators: [(Story) => <div style={{ width: '280px' }}><Story /></div>],
};

export const NullScores: Story = {
  name: 'スコア未評価',
  args: {
    data: {
      id: '5',
      name: '高橋 美咲',
      subtitle: '新入社員',
      scores: [
        { label: '技術', value: null },
        { label: 'コミュニケーション', value: null },
        { label: 'リーダーシップ', value: null },
      ],
    },
    selected: false,
  },
  decorators: [(Story) => <div style={{ width: '280px' }}><Story /></div>],
};
