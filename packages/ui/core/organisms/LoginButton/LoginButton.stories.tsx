import type { Meta, StoryObj } from '@storybook/react';

import { LoginButton } from './LoginButton';

const meta: Meta<typeof LoginButton> = {
  title: 'アクション/LoginButton',
  component: LoginButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof LoginButton>;

export const Ready: Story = {
  args: {
    state: 'ready',
    children: 'ログイン',
  },
};

export const Authenticating: Story = {
  args: {
    state: 'authenticating',
    children: 'ログイン',
    loadingText: '認証中...',
  },
};

export const Authenticated: Story = {
  args: {
    state: 'authenticated',
    children: 'ログイン',
  },
};

export const FullWidth: Story = {
  args: {
    state: 'ready',
    children: 'ログイン',
    fullWidth: true,
    size: 'lg',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};
