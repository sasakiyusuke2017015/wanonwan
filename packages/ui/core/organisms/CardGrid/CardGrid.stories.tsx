import { CardGrid } from './CardGrid';

import type { Meta, StoryObj } from '@storybook/react';


const meta: Meta<typeof CardGrid> = {
  title: '表示/カード/CardGrid',
  component: CardGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    animated: {
      description: 'アニメーションを有効にする',
      control: 'boolean',
    },
    cols: {
      description: 'カラム数（レスポンシブ対応）',
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    gap: {
      description: 'カード間のギャップ（Tailwindの数値）',
      control: 'number',
    },
    enableAnimation: {
      description: 'アニメーションを許可する',
      control: 'boolean',
    },
    animationVariant: {
      description: 'アニメーションのバリアント',
      control: 'select',
      options: ['slideRight', 'slideLeft', 'slideUp', 'slideDown', 'fadeIn', 'zoomIn'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardGrid>;

// サンプルカードコンポーネント
const SampleCard = ({ title, color }: { title: string; color: string }) => (
  <div
    className={`${color} rounded-lg p-6 shadow-lg`}
  >
    <h3 className="text-fluid-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-white/80">サンプルカードコンテンツ</p>
  </div>
);

export const AnimatedCards: Story = {
  args: {
    animated: true,
    cols: 4,
    gap: 4,
  },
  render: (args) => (
    <CardGrid {...args}>
      <CardGrid.Item>
        <SampleCard title="カード 1" color="bg-blue-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 2" color="bg-green-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 3" color="bg-purple-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 4" color="bg-red-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 5" color="bg-yellow-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 6" color="bg-pink-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 7" color="bg-indigo-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 8" color="bg-orange-500" />
      </CardGrid.Item>
    </CardGrid>
  ),
};

export const NoAnimation: Story = {
  args: {
    animated: false,
    cols: 4,
    gap: 4,
  },
  render: (args) => (
    <CardGrid {...args}>
      <CardGrid.Item>
        <SampleCard title="カード 1" color="bg-blue-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 2" color="bg-green-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 3" color="bg-purple-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 4" color="bg-red-500" />
      </CardGrid.Item>
    </CardGrid>
  ),
};

export const TwoColumns: Story = {
  args: {
    animated: true,
    cols: 2,
    gap: 4,
  },
  render: (args) => (
    <CardGrid {...args}>
      <CardGrid.Item>
        <SampleCard title="カード 1" color="bg-blue-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 2" color="bg-green-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 3" color="bg-purple-500" />
      </CardGrid.Item>
      <CardGrid.Item>
        <SampleCard title="カード 4" color="bg-red-500" />
      </CardGrid.Item>
    </CardGrid>
  ),
};

export const ManyCards: Story = {
  args: {
    animated: true,
    cols: 4,
    gap: 4,
  },
  render: (args) => (
    <CardGrid {...args}>
      {Array.from({ length: 12 }, (_, i) => (
        <CardGrid.Item key={i}>
          <SampleCard
            title={`カード ${i + 1}`}
            color={`bg-${['blue', 'green', 'purple', 'red', 'yellow', 'pink'][i % 6]}-500`}
          />
        </CardGrid.Item>
      ))}
    </CardGrid>
  ),
};
