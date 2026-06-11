import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

type Story = StoryObj<typeof Badge>;

/**
 * 汎用バッジコンポーネント
 *
 * 様々な情報を表示するための統合型バッジコンポーネントです。
 * MetricBadge、ScoreBadge、StatusBadgeの機能を1つに統合しました。
 */
const meta: Meta<typeof Badge> = {
  title: '表示/コンテンツ/Badge',
  component: Badge,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ZTvv6vzLXOxlP64TLs6YHB/%E7%84%A1%E9%A1%8C?t=uGI62GQBWdy1FqLU-0',
    },
    layout: 'centered',
    docs: {
      description: {
        component: `
統合型バッジコンポーネント。以下の4つのタイプをサポート:

- **metric**: 指標値表示用(グラデーション効果、ホバーアニメーション付き)
- **score**: スコア表示用(固定幅、中央配置)
- **status**: ステータス表示用(コンパクトなサイズ)
- **default**: 汎用表示用

各タイプは異なるサイズとスタイルオプションを持ちます。
        `.trim(),
      },
      source: {
        transform: (code: string, storyContext: { args: Record<string, unknown> }) => {
          const { args } = storyContext;
          const props = [];

          if (args.value) props.push(`value="${args.value}"`);
          if (args.appearance && args.appearance !== 'default')
            props.push(`appearance="${args.appearance}"`);
          if (args.variant && args.variant !== 'solid')
            props.push(`variant="${args.variant}"`);
          if (args.color && args.color !== 'blue')
            props.push(`color="${args.color}"`);
          if (args.size && args.size !== 'medium')
            props.push(`size="${args.size}"`);
          if (args.width) props.push(`width="${args.width}"`);
          if (args.className) props.push(`className="${args.className}"`);

          const propsString = props.length > 0 ? ' ' + props.join(' ') : '';
          return `import { Badge } from './components/atoms/Badge/Badge';

<Badge${propsString} />`;
        },
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: '表示する値',
      control: { type: 'text' },
    },
    appearance: {
      description: 'バッジの外観モード',
      control: { type: 'select' },
      options: ['default', 'metric', 'score', 'status'],
    },
    styleVariant: {
      description: 'スタイルバリアント（solid, gradient, compact, outline）',
      control: { type: 'select' },
      options: ['solid', 'gradient', 'compact', 'outline'],
    },
    variant: {
      description: 'セマンティックバリアント（色を自動設定）',
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'secondary'],
    },
    color: {
      description: 'バッジの色',
      control: { type: 'select' },
      options: [
        'blue',
        'green',
        'emerald',
        'red',
        'rose',
        'yellow',
        'amber',
        'orange',
        'gray',
      ],
    },
    size: {
      description: 'バッジのサイズ',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    width: {
      description: 'カスタム幅(Tailwindクラス)',
      control: { type: 'text' },
    },
    className: {
      description: '追加のCSSクラス',
      control: { type: 'text' },
    },
  },
};

export default meta;

// デフォルトバッジ
export const Default: Story = {
  args: {
    value: 'デフォルト',
    appearance: 'default',
    styleVariant: 'solid',
    color: 'blue',
    size: 'medium',
    className: 'sdt-default-badge',
  },
};

// Metricタイプ(旧MetricBadge)
export const MetricType: Story = {
  args: {
    value: '95%',
    appearance: 'metric',
    styleVariant: 'gradient',
    color: 'green',
    size: 'medium',
    width: 'w-20',
    className: 'sdt-metric',
  },
};

// Scoreタイプ(旧ScoreBadge)
export const ScoreType: Story = {
  args: {
    value: '4.5',
    appearance: 'score',
    styleVariant: 'solid',
    color: 'blue',
    size: 'medium',
    className: 'sdt-score',
  },
};

// Statusタイプ(旧StatusBadge)
export const StatusType: Story = {
  args: {
    value: '完了',
    appearance: 'status',
    styleVariant: 'solid',
    color: 'green',
    size: 'medium',
    className: 'sdt-status',
  },
};

// サイズバリエーション
export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-4">
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <span className="w-20 text-fluid-sm capitalize">{size}:</span>
          <Badge value={size} size={size} className={`sdt-${size}`} />
          <Badge
            value="90%"
            appearance="metric"
            size={size}
            styleVariant="gradient"
          />
          <Badge value="4" appearance="score" size={size} />
          <Badge value="完了" appearance="status" size={size} />
        </div>
      ))}
    </div>
  ),
};

// カラーバリエーション
export const Colors: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-fluid-sm font-semibold">Solid Variant</h3>
        <div className="flex flex-wrap gap-2">
          {(['blue', 'green', 'red', 'yellow', 'orange', 'gray'] as const).map(
            (color) => (
              <Badge
                key={color}
                value={color}
                color={color}
                className={`sdt-${color}`}
              />
            )
          )}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-fluid-sm font-semibold">Gradient Variant</h3>
        <div className="flex flex-wrap gap-2">
          {(['blue', 'green', 'red', 'yellow', 'orange', 'gray'] as const).map(
            (color) => (
              <Badge
                key={color}
                value={color}
                color={color}
                styleVariant="gradient"
                className={`sdt-${color}-gradient`}
              />
            )
          )}
        </div>
      </div>
    </div>
  ),
};

// Outlineバリエーション
export const Outline: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['blue', 'green', 'red', 'yellow', 'orange', 'gray'] as const).map(
        (color) => (
          <Badge
            key={color}
            value={color}
            color={color}
            styleVariant="outline"
          />
        )
      )}
    </div>
  ),
};

// 実用例
export const UseCases: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-fluid-sm font-semibold">指標表示(Metric)</h3>
        <div className="flex gap-2">
          <Badge
            value="98.5%"
            appearance="metric"
            styleVariant="gradient"
            color="green"
            width="w-24"
          />
          <Badge
            value="2.3秒"
            appearance="metric"
            styleVariant="gradient"
            color="blue"
            width="w-20"
          />
          <Badge
            value="1,234"
            appearance="metric"
            styleVariant="gradient"
            color="yellow"
            width="w-20"
          />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-fluid-sm font-semibold">スコア表示(Score)</h3>
        <div className="flex gap-2">
          <Badge value="5" appearance="score" color="green" />
          <Badge value="4" appearance="score" color="blue" />
          <Badge value="3" appearance="score" color="yellow" />
          <Badge value="2" appearance="score" color="orange" />
          <Badge value="1" appearance="score" color="red" />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-fluid-sm font-semibold">ステータス表示(Status)</h3>
        <div className="flex gap-2">
          <Badge value="完了" appearance="status" color="green" />
          <Badge value="進行中" appearance="status" color="blue" />
          <Badge value="レビュー中" appearance="status" color="yellow" />
          <Badge value="保留" appearance="status" color="gray" />
          <Badge value="却下" appearance="status" color="red" />
        </div>
      </div>
    </div>
  ),
};
