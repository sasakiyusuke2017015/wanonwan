import type { Meta, StoryObj } from '@storybook/react';

import { ScoreBadge } from './ScoreBadge';

const meta: Meta<typeof ScoreBadge> = {
  title: 'データ表示/統計/ScoreBadge',
  component: ScoreBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ScoreBadge>;

export const High: Story = {
  args: {
    score: 4.8,
  },
};

export const Good: Story = {
  args: {
    score: 3.7,
  },
};

export const Average: Story = {
  args: {
    score: 2.5,
  },
};

export const Low: Story = {
  args: {
    score: 1.2,
  },
};

export const AllScores = {
  render: () => (
    <div className="flex gap-3 items-center">
      {[5.0, 4.5, 3.5, 2.5, 1.5, 1.0].map((score) => (
        <ScoreBadge key={score} score={score} size="medium" />
      ))}
    </div>
  ),
};
