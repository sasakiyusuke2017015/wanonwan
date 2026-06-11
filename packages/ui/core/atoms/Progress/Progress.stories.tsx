import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

type Story = StoryObj<typeof Progress>;

const meta: Meta<typeof Progress> = {
  title: 'フィードバック/通知/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: '現在の値',
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    max: {
      description: '最大値',
      control: { type: 'number' },
    },
    size: {
      description: 'サイズ',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    color: {
      description: '色',
      control: { type: 'select' },
      options: ['blue', 'green', 'red', 'yellow', 'gray', 'orange'],
    },
    showLabel: {
      description: 'パーセントラベルを表示',
      control: { type: 'boolean' },
    },
    isStalled: {
      description: '停滞状態（警告色に自動変更）',
      control: { type: 'boolean' },
    },
    animation: {
      description: 'アニメーション種類',
      control: { type: 'select' },
      options: ['none', 'pulse', 'shimmer'],
    },
  },
};

export default meta;

export const Default: Story = {
  args: {
    value: 60,
    size: 'medium',
    color: 'blue',
  },
  decorators: [(Story) => <div style={{ width: '300px' }}><Story /></div>],
};

export const Sizes: Story = {
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size}>
          <span style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>{size}</span>
          <Progress value={65} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {(['blue', 'green', 'red', 'yellow', 'orange', 'gray'] as const).map((color) => (
        <div key={color}>
          <span style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>{color}</span>
          <Progress value={70} color={color} />
        </div>
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    value: 75,
    size: 'large',
    color: 'green',
    showLabel: true,
  },
  decorators: [(Story) => <div style={{ width: '300px' }}><Story /></div>],
};

export const Stalled: Story = {
  name: '停滞状態',
  args: {
    value: 45,
    size: 'medium',
    isStalled: true,
  },
  decorators: [(Story) => <div style={{ width: '300px' }}><Story /></div>],
};

export const Animations: Story = {
  name: 'アニメーション',
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <span style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>none（静止）</span>
        <Progress value={60} animation="none" />
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>pulse（点滅）</span>
        <Progress value={60} animation="pulse" />
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>shimmer（流れる光）</span>
        <Progress value={60} animation="shimmer" />
      </div>
    </div>
  ),
};

export const FoodHPExample: Story = {
  name: '食材HP表示例',
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>安全 (80%)</span>
        <Progress value={80} size="small" color="green" />
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>注意 (35%)</span>
        <Progress value={35} size="small" color="yellow" />
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>危険 (10%)</span>
        <Progress value={10} size="small" color="red" />
      </div>
    </div>
  ),
};
