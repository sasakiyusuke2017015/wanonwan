import type { Meta, StoryObj } from '@storybook/react';

import { ReplayButton } from './ReplayButton';

const meta: Meta<typeof ReplayButton> = {
  title: 'アクション/ReplayButton',
  component: ReplayButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ReplayButton>;

export const Default: Story = {
  args: {
    label: '再生',
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'もう一度',
    variant: 'primary',
    size: 'medium',
  },
};
