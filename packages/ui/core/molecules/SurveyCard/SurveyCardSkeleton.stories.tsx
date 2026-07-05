import type { Meta, StoryObj } from '@storybook/react';

import { SurveyCardSkeleton } from './SurveyCardSkeleton';

const meta: Meta<typeof SurveyCardSkeleton> = {
  title: '表示/カード/SurveyCardSkeleton',
  component: SurveyCardSkeleton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SurveyCardSkeleton>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <SurveyCardSkeleton {...args} />
    </div>
  ),
};
