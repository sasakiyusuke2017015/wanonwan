import { LOADING_ICON_TYPES } from '../../constants/icons';

import { LoadingZone } from './LoadingZone';

import type { Meta, StoryObj } from '@storybook/react';

// Storybook用のローカル定数
const ALL_ANIMATION_EASE = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'cubic-bezier(0.4, 0, 0.2, 1)',
] as const;

const meta: Meta<typeof LoadingZone> = {
  title: 'フィードバック/ローディング/LoadingZone',
  component: LoadingZone,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['table', 'card', 'list', 'simple', 'overlay', 'inline'],
    },
    height: {
      control: 'text',
    },
    message: {
      control: 'text',
    },
    iconName: {
      control: { type: 'select' },
      options: LOADING_ICON_TYPES,
    },
    size: {
      control: { type: 'range', min: 16, max: 64, step: 4 },
    },
    color: {
      control: 'text',
    },
    duration: {
      control: { type: 'range', min: 0.1, max: 5, step: 0.1 },
    },
    ease: {
      control: { type: 'select' },
      options: ALL_ANIMATION_EASE,
    },
    repeat: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
    },
    fill: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'simple',
    message: 'データを読み込み中...',
    iconName: 'spinner',
    size: 32,
    color: 'text-indigo-600',
  },
};

export const AllTypes: Story = {
  args: {},
  render: () => {
    const types = [
      'table',
      'card',
      'list',
      'simple',
      'overlay',
      'inline',
    ] as const;

    return (
      <div className="space-y-8">
        {types.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="text-fluid-lg font-semibold">Type: {variant}</h3>
            <div
              style={{
                height: variant === 'overlay' ? '300px' : 'auto',
                position: 'relative',
              }}
            >
              <LoadingZone
                variant={variant}
                height={variant === 'inline' ? 'auto' : '200px'}
                message={`${variant}タイプのローディング表示`}
                iconName={'spinner'}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const DifferentIcons: Story = {
  args: {},
  render: () => {
    const iconNames = [
      'spinner',
      'loading-dots-fade',
      'loading-wave',
      'loading-clock',
      'loading-wifi',
      'loading-orbit',
    ];

    return (
      <div className="grid grid-cols-2 gap-6">
        {iconNames.map((iconName) => (
          <div key={iconName} className="space-y-2">
            <h4 className="text-md font-medium">{iconName}</h4>
            <LoadingZone
              variant="card"
              height="150px"
              message="読み込み中..."
              iconName={iconName}
              size={32}
            />
          </div>
        ))}
      </div>
    );
  },
};

export const TableLoading: Story = {
  args: {
    variant: 'table',
    height: '400px',
    message: 'テーブルデータを読み込み中...',
    iconName: 'loading-wave',
    size: 48,
  },
};

export const CardLoading: Story = {
  args: {
    variant: 'card',
    height: '200px',
    message: 'カードデータを読み込み中...',
    iconName: 'loading-pulse-ring',
    size: 40,
    color: 'text-blue-500',
  },
};

export const ListLoading: Story = {
  args: {
    variant: 'list',
    height: '300px',
    message: 'リストデータを読み込み中...',
    iconName: 'loading-dots-fade',
    size: 32,
    color: 'text-gray-400',
  },
};

export const SimpleLoading: Story = {
  args: {
    variant: 'simple',
    height: '150px',
    message: 'シンプルローディング',
    iconName: 'loading-bounce',
    size: 32,
    color: 'text-green-500',
  },
};

export const InlineLoading: Story = {
  args: {
    variant: 'inline',
    message: 'インラインローディング',
    iconName: 'loading-dots-fade',
    size: 16,
    color: 'text-gray-600',
  },
};

export const OverlayLoading: Story = {
  args: {},
  render: () => (
    <div
      style={{ height: '400px', position: 'relative', background: '#f3f4f6' }}
    >
      <div className="p-8">
        <h2 className="mb-4 text-fluid-xl font-bold">背景コンテンツ</h2>
        <p>このコンテンツの上にオーバーレイローディングが表示されます。</p>
      </div>
      <LoadingZone
        variant="overlay"
        message="処理中です..."
        iconName={'loading-orbit'}
        size={48}
        color="text-indigo-600"
      />
    </div>
  ),
};

export const CustomSizes: Story = {
  args: {},
  render: () => {
    const sizes = [16, 24, 32, 48, 64];

    return (
      <div className="space-y-6">
        <h3 className="text-fluid-lg font-semibold">サイズバリエーション</h3>
        <div className="grid grid-cols-5 gap-4">
          {sizes.map((size) => (
            <div key={size} className="text-center">
              <LoadingZone
                variant="simple"
                height="120px"
                message={`${size}px`}
                iconName={'loading-clock'}
                size={size}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const CustomColors: Story = {
  args: {},
  render: () => {
    const colors = [
      { name: 'Indigo', class: 'text-indigo-600' },
      { name: 'Blue', class: 'text-blue-600' },
      { name: 'Green', class: 'text-green-600' },
      { name: 'Red', class: 'text-red-600' },
      { name: 'Purple', class: 'text-purple-600' },
      { name: 'Orange', class: 'text-orange-600' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-fluid-lg font-semibold">カラーバリエーション</h3>
        <div className="grid grid-cols-3 gap-4">
          {colors.map((color) => (
            <div key={color.name} className="text-center">
              <LoadingZone
                variant="simple"
                height="120px"
                message={color.name}
                iconName={'loading-wifi'}
                size={32}
                color={color.class}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const SpeedVariations: Story = {
  args: {},
  render: () => {
    const speeds = [
      { duration: 0.5, label: '高速' },
      { duration: 1.0, label: '標準' },
      { duration: 2.0, label: '低速' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-fluid-lg font-semibold">速度バリエーション</h3>
        <div className="grid grid-cols-3 gap-4">
          {speeds.map((speed) => (
            <div key={speed.duration} className="text-center">
              <LoadingZone
                variant="simple"
                height="120px"
                message={`${speed.label} (${speed.duration}s)`}
                iconName={'loading-star'}
                size={32}
                duration={speed.duration}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const UsageExamples: Story = {
  args: {},
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-fluid-lg font-semibold">
          使用例: テーブルローディング
        </h3>
        <LoadingZone
          variant="table"
          height="300px"
          message="従業員データを読み込み中..."
          iconName={'loading-wave'}
          size={48}
        />
      </div>

      <div>
        <h3 className="mb-4 text-fluid-lg font-semibold">使用例: フォーム送信中</h3>
        <div className="relative rounded-lg border bg-white p-6">
          <div className="space-y-4 opacity-50">
            <input className="w-full rounded border p-2" placeholder="名前" />
            <input
              className="w-full rounded border p-2"
              placeholder="メールアドレス"
            />
            <button className="rounded bg-blue-500 px-4 py-2 text-white">
              送信
            </button>
          </div>
          <LoadingZone
            variant="overlay"
            message="送信中..."
            iconName={'loading-orbit'}
            size={40}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-fluid-lg font-semibold">使用例: インライン表示</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded border p-4">
            <span>ユーザーデータ</span>
            <LoadingZone
              variant="inline"
              message="更新中..."
              iconName={'loading-dots-fade'}
              size={16}
            />
          </div>
          <div className="flex items-center justify-between rounded border p-4">
            <span>ファイルアップロード</span>
            <LoadingZone
              variant="inline"
              message="アップロード中..."
              iconName={'loading-progress'}
              size={16}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
