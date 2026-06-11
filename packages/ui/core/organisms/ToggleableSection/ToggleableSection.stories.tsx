import type { Meta, StoryObj } from '@storybook/react';

import { ToggleableSection } from './ToggleableSection';

const meta: Meta<typeof ToggleableSection> = {
  title: 'レイアウト/ToggleableSection',
  component: ToggleableSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ToggleableSection>;

export const Default: Story = {
  args: {
    title: 'セクションタイトル',
    borderColor: '#3B82F6',
    children: (
      <div className="space-y-2">
        <p>セクションの中身です。</p>
        <p>開閉アニメーション付きで表示されます。</p>
      </div>
    ),
  },
};

export const InitiallyClosed: Story = {
  args: {
    title: '閉じた状態',
    borderColor: '#10B981',
    defaultOpen: false,
    children: <p>クリックで開きます。</p>,
  },
};

export const CustomColors: Story = {
  args: {
    title: 'カスタムカラー',
    borderColor: '#EF4444',
    buttonBgColor: 'bg-red-50',
    contentBgColor: 'bg-red-50/30',
    hoverBgColor: 'hover:bg-red-100/80',
    children: <p>赤系のカスタムカラーセクション。</p>,
  },
};
