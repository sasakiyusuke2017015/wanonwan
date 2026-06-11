import type { Meta, StoryObj } from '@storybook/react';

import { BackButton } from './BackButton';

const meta: Meta<typeof BackButton> = {
  title: 'ナビゲーション/リンク/BackButton',
  component: BackButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof BackButton>;

export const Default: Story = {
  args: {
    label: '戻る',
  },
};

export const CustomLabel: Story = {
  args: {
    label: '一覧へ戻る',
    variant: 'outline',
    size: 'medium',
  },
};

export const Disabled: Story = {
  args: {
    label: '戻る',
    disabled: true,
  },
};
