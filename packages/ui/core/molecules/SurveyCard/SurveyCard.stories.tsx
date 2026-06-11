import type { Meta, StoryObj } from '@storybook/react';

import { SurveyCard } from './SurveyCard';

const meta: Meta<typeof SurveyCard> = {
  title: '表示/カード/SurveyCard',
  component: SurveyCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof SurveyCard>;

export const Default: Story = {
  args: {
    id: '1',
    title: '従業員満足度アンケート',
    description: '半期ごとの従業員満足度調査です。所要時間は約10分です。',
    period: '2026/03/01 - 2026/03/31',
    status: '受付中',
    statusColor: 'green',
    headerColor: 'bg-blue-600',
    buttonVariant: 'primary',
    buttonText: '回答する',
    buttonIcon: 'chevron-right',
  },
};

export const Closed: Story = {
  args: {
    id: '2',
    title: '研修フィードバック',
    period: '2026/02/01 - 2026/02/28',
    status: '終了',
    statusColor: 'gray',
    headerColor: 'bg-gray-500',
    buttonVariant: 'outline',
    buttonText: '結果を見る',
  },
};
