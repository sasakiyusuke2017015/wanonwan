import {
  ALL_ICON_TYPES,
  LOADING_ICON_TYPES,
  type IconName,
} from '../../constants/icons';
import { SEMANTIC_COLORS } from '../../constants/design';

import { Icon } from './Icon';

import type { Meta, StoryObj } from '@storybook/react';

// Storybook用のローカル定数
// SEMANTIC_COLORSの値を含む色一覧
const ALL_ICON_COLORS = [
  'currentColor',
  '#000000',
  '#FFFFFF',
  SEMANTIC_COLORS.success,  // #10B981
  SEMANTIC_COLORS.info,     // #3B82F6
  SEMANTIC_COLORS.danger,   // #EF4444
  SEMANTIC_COLORS.warning,  // #F59E0B
  SEMANTIC_COLORS.primary,  // #6366F1
] as const;

const ALL_ANIMATION_EASE = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'cubic-bezier(0.4, 0, 0.2, 1)',
] as const;

// プリセット一覧
const LOADING_PRESETS = [
  'spinner',
  'dots',
  'pulse',
  'cube',
  'cube-glow',
  'interview',
  'dna',
  'atom',
  'rings',
  'gears',
  'hourglass',
  'wave',
  'radar',
  'eclipse',
] as const;

const meta: Meta<typeof Icon> = {
  title: 'アイコン/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    preset: {
      control: { type: 'select' },
      options: [undefined, ...LOADING_PRESETS],
      description: 'ローディングプリセット（指定するとnameが自動設定される）',
    },
    name: {
      control: { type: 'select' },
      options: ALL_ICON_TYPES,
    },
    size: {
      control: { type: 'range', min: 16, max: 64, step: 4 },
    },
    className: {
      control: 'text',
    },
    fill: {
      control: { type: 'select' },
      options: ['none', ...ALL_ICON_COLORS, '#FF0000', '#00FF00', '#0000FF'],
    },
    stroke: {
      control: { type: 'select' },
      options: [
        'currentColor',
        ...ALL_ICON_COLORS,
        '#FF0000',
        '#00FF00',
        '#0000FF',
      ],
    },
    animationTrigger: {
      control: { type: 'select' },
      options: ['hover', 'tap', 'condition', 'none'],
    },
    hoverScale: {
      control: { type: 'range', min: 1, max: 2, step: 0.1 },
    },
    tapScale: {
      control: { type: 'range', min: 0.5, max: 1, step: 0.05 },
    },
    ease: {
      control: { type: 'select' },
      options: ALL_ANIMATION_EASE,
    },
    duration: {
      control: { type: 'range', min: 0.1, max: 5, step: 0.1 },
    },
    repeat: {
      control: { type: 'number' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'magnifying-glass',
    size: 24,
  },
};

export const AllIcons: Story = {
  args: {},
  render: () => {
    return (
      <div className="grid grid-cols-4 gap-8 p-8">
        {(ALL_ICON_TYPES as readonly IconName[]).map((type) => (
          <div key={type} className="flex flex-col items-center space-y-2">
            <Icon name={type} size={32} className="text-gray-700" />
            <span className="font-mono text-fluid-sm text-gray-600">{type}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const sizes = [16, 20, 24, 32, 48, 64];

    return (
      <div className="flex items-center space-x-6 p-8">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col items-center space-y-2">
            <Icon
              name={'magnifying-glass'}
              size={size}
              className="text-blue-600"
            />
            <span className="text-fluid-sm text-gray-600">{size}px</span>
          </div>
        ))}
      </div>
    );
  },
};

export const Colors: Story = {
  render: () => {
    const colors = [
      { name: 'Primary', color: 'primary' as const },
      { name: 'Secondary', color: 'secondary' as const },
      { name: 'Success', color: 'success' as const },
      { name: 'Warning', color: 'warning' as const },
      { name: 'Danger', color: 'danger' as const },
      { name: 'Info', color: 'info' as const },
    ];

    return (
      <div className="grid grid-cols-3 gap-6 p-8">
        {colors.map((colorItem) => (
          <div
            key={colorItem.name}
            className="flex flex-col items-center space-y-2"
          >
            <Icon
              name={'person'}
              size={32}
              stroke={colorItem.color}
            />
            <span className="text-fluid-sm text-gray-600">{colorItem.name}</span>
            <span className="text-fluid-xs text-gray-500">
              stroke="{colorItem.color}"
            </span>
          </div>
        ))}
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-6 p-8">
      <div className="flex items-center space-x-4">
        <Icon
          name={'magnifying-glass'}
          size={20}
          className="text-blue-600"
        />
        <span>検索アイコン</span>
      </div>

      <div className="flex items-center space-x-4">
        <Icon
          name={'person'}
          size={20}
          className="text-green-600"
        />
        <span>ユーザーアイコン</span>
      </div>

      <div className="flex items-center space-x-4">
        <Icon
          name={'info-triangle'}
          size={20}
          className="text-yellow-600"
        />
        <span>警告アイコン</span>
      </div>

      <div className="flex items-center space-x-4">
        <Icon
          name={'spinner'}
          size={20}
          className="text-blue-600"
        />
        <span>ローディングアイコン(回転)</span>
      </div>
    </div>
  ),
};

export const ButtonExamples: Story = {
  render: () => (
    <div className="space-y-4 p-8">
      <button className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
        <Icon name={'magnifying-glass'} size={16} />
        <span>検索</span>
      </button>

      <button className="flex items-center space-x-2 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
        <Icon name={'arrow-up-right'} size={16} />
        <span>外部リンク</span>
      </button>

      <button className="flex items-center space-x-2 rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
        <Icon name={'hamburger'} size={16} />
        <span>メニュー</span>
      </button>
    </div>
  ),
};

// アニメーション機能のストーリー
export const HoverAnimation: Story = {
  args: {
    name: 'eye',
    size: 32,
    className: 'text-blue-600 cursor-pointer',
    animationTrigger: 'hover',
    hoverScale: 1.2,
    tapScale: 0.9,
  },
};

export const TapAnimation: Story = {
  args: {
    name: 'lock',
    size: 32,
    className: 'text-green-600 cursor-pointer',
    animationTrigger: 'tap',
    tapScale: 0.8,
  },
};

export const ConditionalAnimation: Story = {
  args: {
    name: 'spinner',
    size: 32,
    className: 'text-purple-600',
    animationTrigger: 'condition',
    condition: true,
    conditionAnimation: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity as number,
      ease: 'linear',
    },
  },
};

export const StylingExamples: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div className="mb-4 text-fluid-lg font-semibold">スタイリング例</div>

      <div className="space-y-4">
        <div className="text-md font-semibold text-blue-600">
          Fill vs Stroke の違い
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-4 text-fluid-sm text-blue-800">
            <strong>Fill</strong>: アイコンの内側を塗りつぶす色
            <br />
            <strong>Stroke</strong>: アイコンの枠線・輪郭の色
          </p>
          <div className="flex items-center space-x-8">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={48}
                fill="red"
                stroke="none"
              />
              <span className="text-fluid-sm font-medium">Fill のみ</span>
              <span className="text-fluid-xs text-gray-600">
                fill="red" stroke="none"
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={48}
                fill="none"
                stroke="blue"
                strokeWidth={3}
              />
              <span className="text-fluid-sm font-medium">Stroke のみ</span>
              <span className="text-fluid-xs text-gray-600">
                fill="none" stroke="blue"
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={48}
                fill="yellow"
                stroke="red"
                strokeWidth={3}
              />
              <span className="text-fluid-sm font-medium">Fill + Stroke</span>
              <span className="text-fluid-xs text-gray-600">
                fill="yellow" stroke="red"
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-md font-semibold">Fill色の変更(塗りつぶし)</div>
        <div className="flex items-center space-x-6 rounded-lg border p-4">
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'info-circle'}
              size={32}
              fill="red"
              stroke="none"
            />
            <span className="text-fluid-sm">fill="red"</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'info-circle'}
              size={32}
              fill="blue"
              stroke="none"
            />
            <span className="text-fluid-sm">fill="blue"</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'info-circle'}
              size={32}
              fill="green"
              stroke="none"
            />
            <span className="text-fluid-sm">fill="green"</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'info-circle'}
              size={32}
              fill="currentColor"
              stroke="none"
              className="text-purple-600"
            />
            <span className="text-fluid-sm">fill="currentColor"</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-md font-semibold">Stroke色とStrokeWidth(枠線)</div>
        <div className="flex items-center space-x-6 rounded-lg border p-4">
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'person'}
              size={32}
              fill="none"
              stroke="red"
              strokeWidth={1}
            />
            <span className="text-fluid-sm">stroke="red" width=1</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'person'}
              size={32}
              fill="none"
              stroke="blue"
              strokeWidth={2}
            />
            <span className="text-fluid-sm">stroke="blue" width=2</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'person'}
              size={32}
              fill="none"
              stroke="green"
              strokeWidth={3}
            />
            <span className="text-fluid-sm">stroke="green" width=3</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'person'}
              size={32}
              fill="none"
              stroke="orange"
              strokeWidth={4}
            />
            <span className="text-fluid-sm">stroke="orange" width=4</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-md font-semibold">さまざまな組み合わせ</div>
        <div className="grid grid-cols-2 gap-6 rounded-lg border p-4">
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'calendar'}
              size={40}
              fill="lightgreen"
              stroke="darkgreen"
              strokeWidth={2}
            />
            <span className="text-fluid-sm">塗り: 薄緑 / 枠: 濃緑</span>
            <span className="text-fluid-xs text-gray-600">
              fill="lightgreen" stroke="darkgreen"
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'calendar'}
              size={40}
              fill="yellow"
              stroke="red"
              strokeWidth={3}
            />
            <span className="text-fluid-sm">塗り: 黄色 / 枠: 赤</span>
            <span className="text-fluid-xs text-gray-600">
              fill="yellow" stroke="red"
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'calendar'}
              size={40}
              fill="none"
              stroke="purple"
              strokeWidth={3}
            />
            <span className="text-fluid-sm">塗りなし / 枠: 紫</span>
            <span className="text-fluid-xs text-gray-600">
              fill="none" stroke="purple"
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icon
              name={'calendar'}
              size={40}
              fill="pink"
              stroke="none"
            />
            <span className="text-fluid-sm">塗り: ピンク / 枠なし</span>
            <span className="text-fluid-xs text-gray-600">
              fill="pink" stroke="none"
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AnimatedIconExamples: Story = {
  render: () => (
    <div className="space-y-6 p-8">
      <div className="mb-4 text-fluid-lg font-semibold">
        アニメーション付きアイコン
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'eye'}
          size={24}
          className="cursor-pointer text-blue-600"
          animationTrigger="hover"
          hoverScale={1.2}
        />
        <span>ホバーでスケール(eye)</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'eye-slashed'}
          size={24}
          stroke="red"
          strokeWidth={2}
          className="cursor-pointer"
          animationTrigger="hover"
          hoverScale={1.2}
        />
        <span>ホバーでスケール(eye-slashed)- カスタムstroke</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'lock'}
          size={24}
          fill="lightgreen"
          stroke="darkgreen"
          strokeWidth={2}
          className="cursor-pointer"
          animationTrigger="tap"
          tapScale={0.8}
        />
        <span>タップでスケール(lock)- カスタムfill/stroke</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'bell'}
          size={24}
          fill="red"
          stroke="darkred"
          strokeWidth={1}
          className="cursor-pointer"
          animationTrigger="condition"
          condition={true}
        />
        <span>通知ベル(shake)- カスタムカラー</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'info-triangle'}
          size={24}
          stroke="orange"
          strokeWidth={3}
          animationTrigger="condition"
          condition={true}
          conditionAnimation={{ x: [-3, 3, -3, 3, 0] }}
          transition={{
            repeat: Infinity as number,
            duration: 0.5,
            repeatDelay: 2,
          }}
        />
        <span>カスタムShakeアニメーション(info-triangle)</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'spinner'}
          size={24}
          stroke="indigo"
          strokeWidth={3}
          animationTrigger="condition"
          condition={true}
          conditionAnimation={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 1,
            repeat: Infinity as number,
            ease: 'linear',
          }}
        />
        <span>回転アニメーション(spinner)- カスタムstroke</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon name={'loading-dots'} size={24} stroke="green" />
        <span>Loading Dots(自動アニメーション)</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'loading-pulse'}
          size={24}
          stroke="purple"
          strokeWidth={3}
        />
        <span>Loading Pulse(自動アニメーション)</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon name={'loading-bars'} size={24} fill="cyan" />
        <span>Loading Bars(自動アニメーション)</span>
      </div>

      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Icon
          name={'person'}
          size={24}
          className="text-gray-600"
          animationTrigger="none"
        />
        <span>アニメーションなし(person)</span>
      </div>
    </div>
  ),
};

export const FillAndStrokeProperties: Story = {
  render: () => {
    const colorTests = [
      { name: 'Primary', color: 'primary' as const },
      { name: 'Blue', color: 'blue' as const },
      { name: 'Red', color: 'red' as const },
      { name: 'Green', color: 'green' as const },
      { name: 'Yellow', color: 'yellow' as const },
      { name: 'Purple', color: 'purple' as const },
      { name: 'Pink', color: 'pink' as const },
      { name: 'Indigo', color: 'indigo' as const },
      { name: 'Orange', color: 'orange' as const },
      { name: 'Gray', color: 'gray' as const },
      { name: 'Dark', color: 'dark' as const },
      { name: 'Current', color: 'current' as const },
    ];

    return (
      <div className="space-y-8 p-8">
        <div className="mb-4 text-fluid-lg font-semibold">
          Fill と Stroke プロパティのテスト
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">Info-circle (fill対応)</div>
          <div className="grid grid-cols-4 gap-4 rounded-lg border p-4">
            {colorTests.map((colorItem) => (
              <div
                key={colorItem.name}
                className="flex flex-col items-center space-y-2"
              >
                <Icon
                  name={'info-circle'}
                  size={32}
                  fill={colorItem.color}
                  stroke="none"
                />
                <span className="text-fluid-sm">{colorItem.name}</span>
                <span className="text-fluid-xs text-gray-500">
                  fill="{colorItem.color}"
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">Person (stroke対応)</div>
          <div className="grid grid-cols-4 gap-4 rounded-lg border p-4">
            {colorTests.map((colorItem) => (
              <div
                key={colorItem.name}
                className="flex flex-col items-center space-y-2"
              >
                <Icon
                  name={'person'}
                  size={32}
                  stroke={colorItem.color}
                />
                <span className="text-fluid-sm">{colorItem.name}</span>
                <span className="text-fluid-xs text-gray-500">
                  stroke="{colorItem.color}"
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">
            spinner (ease対応 - 全パターン)
          </div>
          <div className="grid grid-cols-4 gap-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="blue"
                ease="linear"
              />
              <span className="text-fluid-sm">Linear</span>
              <span className="text-fluid-xs text-gray-500">ease="linear"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="green"
                ease="easeIn"
              />
              <span className="text-fluid-sm">Ease In</span>
              <span className="text-fluid-xs text-gray-500">ease="easeIn"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="purple"
                ease="easeOut"
              />
              <span className="text-fluid-sm">Ease Out</span>
              <span className="text-fluid-xs text-gray-500">ease="easeOut"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="orange"
                ease="easeInOut"
              />
              <span className="text-fluid-sm">Ease In Out</span>
              <span className="text-fluid-xs text-gray-500">ease="easeInOut"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="red"
                ease="circIn"
              />
              <span className="text-fluid-sm">Circ In</span>
              <span className="text-fluid-xs text-gray-500">ease="circIn"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="indigo"
                ease="circOut"
              />
              <span className="text-fluid-sm">Circ Out</span>
              <span className="text-fluid-xs text-gray-500">ease="circOut"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="pink"
                ease="circInOut"
              />
              <span className="text-fluid-sm">Circ In Out</span>
              <span className="text-fluid-xs text-gray-500">ease="circInOut"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="yellow"
                ease="backIn"
              />
              <span className="text-fluid-sm">Back In</span>
              <span className="text-fluid-xs text-gray-500">ease="backIn"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="cyan"
                ease="backOut"
              />
              <span className="text-fluid-sm">Back Out</span>
              <span className="text-fluid-xs text-gray-500">ease="backOut"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="gray"
                ease="backInOut"
              />
              <span className="text-fluid-sm">Back In Out</span>
              <span className="text-fluid-xs text-gray-500">ease="backInOut"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="#6366F1"
                ease="anticipate"
              />
              <span className="text-fluid-sm">Anticipate</span>
              <span className="text-fluid-xs text-gray-500">ease="anticipate"</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">spinner (duration対応)</div>
          <div className="grid grid-cols-4 gap-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="red"
                duration={0.5}
              />
              <span className="text-fluid-sm">Fast</span>
              <span className="text-fluid-xs text-gray-500">duration={0.5}</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="blue"
                duration={1.0}
              />
              <span className="text-fluid-sm">Normal</span>
              <span className="text-fluid-xs text-gray-500">duration={1.0}</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="green"
                duration={2.0}
              />
              <span className="text-fluid-sm">Slow</span>
              <span className="text-fluid-xs text-gray-500">duration={2.0}</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="purple"
                duration={3.0}
              />
              <span className="text-fluid-sm">Very Slow</span>
              <span className="text-fluid-xs text-gray-500">duration={3.0}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">spinner (組み合わせ)</div>
          <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="#6366F1"
                ease="backOut"
                duration={1.5}
              />
              <span className="text-fluid-sm">Primary + BackOut</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="#6366F1" ease="backOut" duration={1.5}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="#EF4444"
                ease="anticipate"
                duration={0.8}
              />
              <span className="text-fluid-sm">Danger + Anticipate</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="#EF4444" ease="anticipate" duration={0.8}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="#10B981"
                ease="circOut"
                duration={2.5}
              />
              <span className="text-fluid-sm">Success + CircOut</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="#10B981" ease="circOut" duration={2.5}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="#F59E0B"
                ease="easeIn"
                duration={0.6}
              />
              <span className="text-fluid-sm">Warning + EaseIn</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="#F59E0B" ease="easeIn" duration={0.6}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="#3B82F6"
                ease="backIn"
                duration={1.0}
              />
              <span className="text-fluid-sm">Info + BackIn</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="#3B82F6" ease="backIn" duration={1.0}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="purple"
                ease="easeInOut"
                duration={3.0}
              />
              <span className="text-fluid-sm">Purple + EaseInOut</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="purple" ease="easeInOut" duration={3.0}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="orange"
                ease="circIn"
                duration={1.8}
              />
              <span className="text-fluid-sm">Orange + CircIn</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="orange" ease="circIn" duration={1.8}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="pink"
                ease="backInOut"
                duration={1.2}
              />
              <span className="text-fluid-sm">Pink + BackInOut</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="pink" ease="backInOut" duration={1.2}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner'}
                size={32}
                stroke="indigo"
                ease="circInOut"
                duration={2.2}
              />
              <span className="text-fluid-sm">Indigo + CircInOut</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="indigo" ease="circInOut" duration={2.2}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const SimplifiedColorSystem: Story = {
  render: () => {
    return (
      <div className="space-y-8 p-8">
        <div className="mb-4 text-fluid-lg font-semibold">
          シンプルな色システム(colorプロパティ削除後)
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">
            1. fillプロパティで直接色コード指定
          </div>
          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={32}
                fill="#F59E0B"
                stroke="none"
              />
              <span className="text-fluid-xs">fill="#F59E0B"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={32}
                fill="#8B5CF6"
                stroke="none"
              />
              <span className="text-fluid-xs">fill="#8B5CF6"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={32}
                fill="#FF6B6B"
                stroke="none"
              />
              <span className="text-fluid-xs">fill="#FF6B6B"</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">
            2. strokeプロパティで直接色コード指定
          </div>
          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'person'}
                size={32}
                stroke="#06B6D4"
                strokeWidth={2}
              />
              <span className="text-fluid-xs">stroke="#06B6D4"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'person'}
                size={32}
                stroke="#F97316"
                strokeWidth={3}
              />
              <span className="text-fluid-xs">stroke="#F97316"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'person'}
                size={32}
                stroke="#4ECDC4"
                strokeWidth={2}
              />
              <span className="text-fluid-xs">stroke="#4ECDC4"</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">
            3. fill + stroke の組み合わせ
          </div>
          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={32}
                fill="#EF4444"
                stroke="#F59E0B"
                strokeWidth={3}
              />
              <span className="text-fluid-xs">fill="#EF4444" stroke="#F59E0B"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={32}
                fill="#10B981"
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <span className="text-fluid-xs">fill="#10B981" stroke="#3B82F6"</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={32}
                fill="#EC4899"
                stroke="none"
              />
              <span className="text-fluid-xs">fill="#EC4899" stroke="none"</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">4. デフォルト値での動作</div>
          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'person'} size={32} />
              <span className="text-fluid-xs">デフォルト</span>
              <span className="text-fluid-xs text-gray-500">
                stroke="currentColor"
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'info-circle'} size={32} />
              <span className="text-fluid-xs">デフォルト</span>
              <span className="text-fluid-xs text-gray-500">
                fill="none" stroke="currentColor"
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-dots'} size={32} />
              <span className="text-fluid-xs">デフォルト</span>
              <span className="text-fluid-xs text-gray-500">fill="currentColor"</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-md font-semibold">
            5. currentColorとclassNameの組み合わせ
          </div>
          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'person'}
                size={32}
                stroke="current"
                className="text-red-500"
              />
              <span className="text-fluid-xs">stroke="current" text-red-500</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'info-circle'}
                size={32}
                fill="current"
                stroke="none"
                className="text-blue-500"
              />
              <span className="text-fluid-xs">fill="current" text-blue-500</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'loading-bars'}
                size={32}
                fill="current"
                className="text-green-500"
              />
              <span className="text-fluid-xs">fill="current" text-green-500</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// ローディングアイコン専用ストーリー
export const LoadingIcons: Story = {
  render: () => {
    return (
      <div className="space-y-8 p-8">
        <div className="mb-4 text-fluid-lg font-semibold">
          ローディングアイコン一覧
        </div>
        <p className="mb-2 text-gray-600">
          以下のアイコンは自動的にアニメーションが適用されます
        </p>

        <div className="grid grid-cols-4 gap-8">
          {LOADING_ICON_TYPES.map((type) => (
            <div
              key={type}
              className="flex flex-col items-center space-y-2 rounded-lg border bg-gray-50 p-4"
            >
              <Icon name={type} size={32} className="text-blue-600" />
              <span className="text-center font-mono text-fluid-sm text-gray-700">
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// ローディングアイコンのカスタマイズ例
export const LoadingIconsCustomized: Story = {
  render: () => {
    return (
      <div className="space-y-8 p-8">
        <div className="mb-4 text-fluid-lg font-semibold">
          ローディングアイコンのカスタマイズ例
        </div>

        <div className="space-y-6">
          <div className="text-md font-semibold">色のカスタマイズ</div>
          <div className="grid grid-cols-3 gap-6 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'spinner'} size={32} stroke="red" />
              <span className="text-fluid-sm">spinner - 赤</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'loading-dots-fade'}
                size={32}
                fill="green"
              />
              <span className="text-fluid-sm">dots-fade - 緑</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'loading-wave'}
                size={32}
                fill="purple"
              />
              <span className="text-fluid-sm">wave - 紫</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-md font-semibold">サイズのバリエーション</div>
          <div className="grid grid-cols-4 gap-6 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-clock'} size={16} stroke="blue" />
              <span className="text-fluid-sm">16px</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-clock'} size={24} stroke="blue" />
              <span className="text-fluid-sm">24px</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-clock'} size={32} stroke="blue" />
              <span className="text-fluid-sm">32px</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-clock'} size={48} stroke="blue" />
              <span className="text-fluid-sm">48px</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-md font-semibold">速度のカスタマイズ</div>
          <div className="grid grid-cols-3 gap-6 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner-thin'}
                size={32}
                stroke="orange"
                duration={0.5}
              />
              <span className="text-fluid-sm">高速 (0.5s)</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner-thin'}
                size={32}
                stroke="orange"
                duration={1.0}
              />
              <span className="text-fluid-sm">標準 (1.0s)</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'spinner-thin'}
                size={32}
                stroke="orange"
                duration={2.0}
              />
              <span className="text-fluid-sm">低速 (2.0s)</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-md font-semibold">新デザインのハイライト</div>
          <div className="grid grid-cols-3 gap-6 rounded-lg border bg-blue-50 p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-wifi'} size={40} stroke="#3B82F6" />
              <span className="text-fluid-sm font-semibold">WiFi波</span>
              <span className="text-fluid-xs text-gray-600">通信状態表示に最適</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-morph'} size={40} fill="purple" />
              <span className="text-fluid-sm font-semibold">モーフィング</span>
              <span className="text-fluid-xs text-gray-600">変形アニメーション</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-orbit'} size={40} fill="#10B981" />
              <span className="text-fluid-sm font-semibold">軌道円</span>
              <span className="text-fluid-xs text-gray-600">惑星軌道風デザイン</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-md font-semibold">形状バリエーション</div>
          <div className="grid grid-cols-4 gap-4 rounded-lg border p-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon
                name={'loading-square'}
                size={32}
                stroke="indigo"
              />
              <span className="text-fluid-sm">四角形</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-triangle'} size={32} stroke="red" />
              <span className="text-fluid-sm">三角形</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-star'} size={32} stroke="yellow" />
              <span className="text-fluid-sm">星形</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-hexagon'} size={32} fill="cyan" />
              <span className="text-fluid-sm">六角形</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// 新デザインローディングアイコン専用ストーリー
export const NewLoadingIconsShowcase: Story = {
  render: () => {
    return (
      <div className="space-y-10 p-8">
        <div className="mb-4 text-fluid-2xl font-bold">
          🎨 新デザイン ローディングアイコン
        </div>
        <p className="mb-6 text-gray-600">
          12種類の新しいローディングアイコンを追加しました。様々な用途に対応できます。
        </p>

        {/* DNA */}
        <div className="space-y-4 rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
          <div className="text-fluid-lg font-bold text-purple-800">🧬 DNA - 二重らせん</div>
          <p className="text-fluid-sm text-purple-600">生体データ分析、遺伝子関連処理、科学的計算に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-dna'} size={40} stroke="purple" fill="purple" />
              <span className="text-fluid-xs">Purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-dna'} size={40} stroke="blue" fill="blue" />
              <span className="text-fluid-xs">Blue</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-dna'} size={40} stroke="green" fill="green" />
              <span className="text-fluid-xs">Green</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-dna'} size={40} stroke="pink" fill="pink" />
              <span className="text-fluid-xs">Pink</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-dna'} size={40} stroke="white" fill="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Ripple */}
        <div className="space-y-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
          <div className="text-fluid-lg font-bold text-blue-800">💧 Ripple - 波紋</div>
          <p className="text-fluid-sm text-blue-600">通知、タッチフィードバック、接続中表示に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-ripple'} size={40} stroke="blue" />
              <span className="text-fluid-xs">Blue</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-ripple'} size={40} stroke="#3B82F6" />
              <span className="text-fluid-xs">Info</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-ripple'} size={40} stroke="#10B981" />
              <span className="text-fluid-xs">Success</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-ripple'} size={40} stroke="#F59E0B" />
              <span className="text-fluid-xs">Warning</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-ripple'} size={40} stroke="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Infinity */}
        <div className="space-y-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6">
          <div className="text-fluid-lg font-bold text-indigo-800">∞ Infinity - 無限</div>
          <p className="text-fluid-sm text-indigo-600">継続処理、無限ループ、同期処理に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-infinity'} size={40} stroke="indigo" />
              <span className="text-fluid-xs">Indigo</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-infinity'} size={40} stroke="purple" />
              <span className="text-fluid-xs">Purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-infinity'} size={40} stroke="#6366F1" />
              <span className="text-fluid-xs">Primary</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-infinity'} size={40} stroke="gray" />
              <span className="text-fluid-xs">Gray</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-infinity'} size={40} stroke="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Atom */}
        <div className="space-y-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 p-6">
          <div className="text-fluid-lg font-bold text-cyan-800">⚛️ Atom - 原子</div>
          <p className="text-fluid-sm text-cyan-600">科学的処理、計算中、React関連に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-atom'} size={40} stroke="#3B82F6" fill="#3B82F6" />
              <span className="text-fluid-xs">Info</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-atom'} size={40} stroke="blue" fill="blue" />
              <span className="text-fluid-xs">Blue</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-atom'} size={40} stroke="purple" fill="purple" />
              <span className="text-fluid-xs">Purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-atom'} size={40} stroke="orange" fill="orange" />
              <span className="text-fluid-xs">Orange</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-atom'} size={40} stroke="white" fill="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Heartbeat */}
        <div className="space-y-4 rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <div className="text-fluid-lg font-bold text-red-800">💓 Heartbeat - 心電図</div>
          <p className="text-fluid-sm text-red-600">ヘルスケア、生存確認、バイタルモニタリングに最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-heartbeat'} size={40} stroke="#EF4444" />
              <span className="text-fluid-xs">Danger</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-heartbeat'} size={40} stroke="red" />
              <span className="text-fluid-xs">Red</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-heartbeat'} size={40} stroke="pink" />
              <span className="text-fluid-xs">Pink</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-heartbeat'} size={40} stroke="#10B981" />
              <span className="text-fluid-xs">Success</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-heartbeat'} size={40} stroke="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Hourglass */}
        <div className="space-y-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
          <div className="text-fluid-lg font-bold text-amber-800">⏳ Hourglass - 砂時計</div>
          <p className="text-fluid-sm text-amber-600">待機時間、タイマー、時間経過表示に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-hourglass'} size={40} stroke="#F59E0B" fill="#F59E0B" />
              <span className="text-fluid-xs">Warning</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-hourglass'} size={40} stroke="orange" fill="orange" />
              <span className="text-fluid-xs">Orange</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-hourglass'} size={40} stroke="yellow" fill="yellow" />
              <span className="text-fluid-xs">Yellow</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-hourglass'} size={40} stroke="gray" fill="gray" />
              <span className="text-fluid-xs">Gray</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-hourglass'} size={40} stroke="white" fill="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Gears */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-gray-100 p-6">
          <div className="text-fluid-lg font-bold text-gray-800">⚙️ Gears - 歯車</div>
          <p className="text-fluid-sm text-gray-600">システム処理、設定中、バックグラウンドタスクに最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-gears'} size={40} stroke="gray" fill="none" />
              <span className="text-fluid-xs">Gray</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-gears'} size={40} stroke="#1F2937" fill="none" />
              <span className="text-fluid-xs">Dark</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-gears'} size={40} stroke="blue" fill="none" />
              <span className="text-fluid-xs">Blue</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-gears'} size={40} stroke="orange" fill="none" />
              <span className="text-fluid-xs">Orange</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-gears'} size={40} stroke="white" fill="none" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="space-y-4 rounded-xl border-2 border-green-200 bg-green-50 p-6">
          <div className="text-fluid-lg font-bold text-green-800">🌊 Wave - サイン波</div>
          <p className="text-fluid-sm text-green-600">音声処理、信号処理、オーディオ関連に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-wave'} size={40} stroke="#10B981" />
              <span className="text-fluid-xs">Success</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-wave'} size={40} stroke="green" />
              <span className="text-fluid-xs">Green</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-wave'} size={40} stroke="blue" />
              <span className="text-fluid-xs">Blue</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-wave'} size={40} stroke="purple" />
              <span className="text-fluid-xs">Purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-wave'} size={40} stroke="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Radar */}
        <div className="space-y-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
          <div className="text-fluid-lg font-bold text-emerald-800">📡 Radar - レーダー</div>
          <p className="text-fluid-sm text-emerald-600">検索中、スキャン中、探索処理に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-radar'} size={40} stroke="#10B981" fill="#10B981" />
              <span className="text-fluid-xs">Success</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-radar'} size={40} stroke="green" fill="green" />
              <span className="text-fluid-xs">Green</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-radar'} size={40} stroke="#3B82F6" fill="#3B82F6" />
              <span className="text-fluid-xs">Info</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-radar'} size={40} stroke="#6366F1" fill="#6366F1" />
              <span className="text-fluid-xs">Primary</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-radar'} size={40} stroke="white" fill="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Cube3D */}
        <div className="space-y-4 rounded-xl border-2 border-violet-200 bg-violet-50 p-6">
          <div className="text-fluid-lg font-bold text-violet-800">📦 Cube3D - 3Dキューブ</div>
          <p className="text-fluid-sm text-violet-600">3D処理、レンダリング、空間計算に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-cube3d'} size={40} stroke="purple" />
              <span className="text-fluid-xs">Purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-cube3d'} size={40} stroke="indigo" />
              <span className="text-fluid-xs">Indigo</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-cube3d'} size={40} stroke="blue" />
              <span className="text-fluid-xs">Blue</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-cube3d'} size={40} stroke="gray" />
              <span className="text-fluid-xs">Gray</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-cube3d'} size={40} stroke="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Rings */}
        <div className="space-y-4 rounded-xl border-2 border-sky-200 bg-sky-50 p-6">
          <div className="text-fluid-lg font-bold text-sky-800">⭕ Rings - 連動リング</div>
          <p className="text-fluid-sm text-sky-600">同期処理、連携中、マルチタスクに最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-rings'} size={40} stroke="#6366F1" />
              <span className="text-fluid-xs">Primary</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-rings'} size={40} stroke="#3B82F6" />
              <span className="text-fluid-xs">Info</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-rings'} size={40} stroke="#10B981" />
              <span className="text-fluid-xs">Success</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-rings'} size={40} stroke="purple" />
              <span className="text-fluid-xs">Purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-rings'} size={40} stroke="white" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Eclipse */}
        <div className="space-y-4 rounded-xl border-2 border-slate-300 bg-slate-100 p-6">
          <div className="text-fluid-lg font-bold text-slate-800">🌑 Eclipse - 月食</div>
          <p className="text-fluid-sm text-slate-600">テーマ切替、ダークモード、時間経過表示に最適</p>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-eclipse'} size={40} stroke="#1F2937" fill="gray" />
              <span className="text-fluid-xs">Dark</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-eclipse'} size={40} stroke="gray" fill="secondary" />
              <span className="text-fluid-xs">Gray</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-eclipse'} size={40} stroke="purple" fill="indigo" />
              <span className="text-fluid-xs">Purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3">
              <Icon name={'loading-eclipse'} size={40} stroke="orange" fill="#F59E0B" />
              <span className="text-fluid-xs">Orange</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-gray-800 p-3">
              <Icon name={'loading-eclipse'} size={40} stroke="white" fill="gray" />
              <span className="text-fluid-xs text-white">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* サイズ比較 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">📐 サイズ比較</div>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-atom'} size={24} stroke="blue" fill="blue" />
              <span className="text-fluid-xs">24px</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-atom'} size={32} stroke="blue" fill="blue" />
              <span className="text-fluid-xs">32px</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-atom'} size={48} stroke="blue" fill="blue" />
              <span className="text-fluid-xs">48px</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name={'loading-atom'} size={64} stroke="blue" fill="blue" />
              <span className="text-fluid-xs">64px</span>
            </div>
          </div>
        </div>

        {/* 使用例 - ボタン内 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🔘 ボタン内での使用例</div>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white">
              <Icon name={'spinner'} size={16} stroke="white" />
              <span>処理中...</span>
            </button>
            <button className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white">
              <Icon name={'loading-dna'} size={16} stroke="white" fill="white" />
              <span>分析中...</span>
            </button>
            <button className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white">
              <Icon name={'loading-radar'} size={16} stroke="white" fill="white" />
              <span>検索中...</span>
            </button>
            <button className="flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 text-white">
              <Icon name={'loading-gears'} size={16} stroke="white" />
              <span>設定中...</span>
            </button>
            <button className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white">
              <Icon name={'loading-heartbeat'} size={16} stroke="white" />
              <span>接続中...</span>
            </button>
          </div>
        </div>

        {/* 全アイコン一覧 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-gray-50 p-6">
          <div className="text-fluid-lg font-bold text-gray-800">📋 新アイコン一覧</div>
          <div className="grid grid-cols-6 gap-4">
            {[
              { name: 'loading-dna', label: 'DNA' },
              { name: 'loading-ripple', label: 'Ripple' },
              { name: 'loading-infinity', label: 'Infinity' },
              { name: 'loading-atom', label: 'Atom' },
              { name: 'loading-heartbeat', label: 'Heartbeat' },
              { name: 'loading-hourglass', label: 'Hourglass' },
              { name: 'loading-gears', label: 'Gears' },
              { name: 'loading-wave', label: 'Wave' },
              { name: 'loading-radar', label: 'Radar' },
              { name: 'loading-cube3d', label: 'Cube3D' },
              { name: 'loading-rings', label: 'Rings' },
              { name: 'loading-eclipse', label: 'Eclipse' },
            ].map((icon) => (
              <div key={icon.label} className="flex flex-col items-center space-y-2 rounded-lg bg-white p-3 shadow-sm">
                <Icon name={icon.name} size={32} stroke="#6366F1" fill="#6366F1" />
                <span className="text-fluid-xs font-medium">{icon.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fill + Stroke 組み合わせ */}
        <div className="space-y-4 rounded-xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 p-6">
          <div className="text-fluid-lg font-bold text-pink-800">🎨 Fill + Stroke の組み合わせ</div>
          <p className="text-fluid-sm text-pink-600">fillとstrokeを別々の色にすることで独自の表現が可能</p>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-atom'} size={48} fill="pink" stroke="purple" />
              <span className="text-fluid-xs">fill=pink stroke=purple</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-radar'} size={48} fill="yellow" stroke="orange" />
              <span className="text-fluid-xs">fill=yellow stroke=orange</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-dna'} size={48} fill="#3B82F6" stroke="#6366F1" />
              <span className="text-fluid-xs">fill=blue stroke=indigo</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-eclipse'} size={48} fill="#F59E0B" stroke="#EF4444" />
              <span className="text-fluid-xs">fill=amber stroke=red</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-hourglass'} size={48} fill="#10B981" stroke="#1F2937" />
              <span className="text-fluid-xs">fill=green stroke=gray-800</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-cube3d'} size={48} fill="none" stroke="#6366F1" />
              <span className="text-fluid-xs">fill=none stroke=indigo</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-rings'} size={48} fill="none" stroke="#10B981" />
              <span className="text-fluid-xs">fill=none stroke=green</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-gears'} size={48} fill="none" stroke="#F59E0B" />
              <span className="text-fluid-xs">fill=none stroke=amber</span>
            </div>
          </div>
        </div>

        {/* アニメーション速度カスタマイズ */}
        <div className="space-y-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-6">
          <div className="text-fluid-lg font-bold text-orange-800">⚡ アニメーション速度</div>
          <p className="text-fluid-sm text-orange-600">durationプロパティで速度を調整</p>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-atom'} size={40} stroke="orange" fill="orange" duration={0.5} />
              <span className="text-fluid-xs font-bold text-red-600">超高速 0.5s</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-atom'} size={40} stroke="orange" fill="orange" duration={1} />
              <span className="text-fluid-xs font-bold text-orange-600">高速 1s</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-atom'} size={40} stroke="orange" fill="orange" duration={2} />
              <span className="text-fluid-xs font-bold text-yellow-600">標準 2s</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-atom'} size={40} stroke="orange" fill="orange" duration={4} />
              <span className="text-fluid-xs font-bold text-green-600">ゆっくり 4s</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-rings'} size={40} stroke="blue" duration={0.3} />
              <span className="text-fluid-xs">Rings 0.3s</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-radar'} size={40} stroke="green" fill="green" duration={0.8} />
              <span className="text-fluid-xs">Radar 0.8s</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-cube3d'} size={40} stroke="purple" duration={6} />
              <span className="text-fluid-xs">Cube3D 6s</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-hourglass'} size={40} stroke="gray" fill="gray" duration={8} />
              <span className="text-fluid-xs">Hourglass 8s</span>
            </div>
          </div>
        </div>

        {/* イージング効果 */}
        <div className="space-y-4 rounded-xl border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 p-6">
          <div className="text-fluid-lg font-bold text-teal-800">🌀 イージング効果</div>
          <p className="text-fluid-sm text-teal-600">easeプロパティでアニメーションの緩急を調整</p>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-rings'} size={40} stroke="teal" ease="linear" />
              <span className="text-fluid-xs">linear</span>
              <span className="text-fluid-xs text-gray-500">一定速度</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-rings'} size={40} stroke="cyan" ease="easeIn" />
              <span className="text-fluid-xs">easeIn</span>
              <span className="text-fluid-xs text-gray-500">ゆっくり→速く</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-rings'} size={40} stroke="blue" ease="easeOut" />
              <span className="text-fluid-xs">easeOut</span>
              <span className="text-fluid-xs text-gray-500">速く→ゆっくり</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-rings'} size={40} stroke="indigo" ease="easeInOut" />
              <span className="text-fluid-xs">easeInOut</span>
              <span className="text-fluid-xs text-gray-500">緩急あり</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-cube3d'} size={40} stroke="purple" ease="backIn" />
              <span className="text-fluid-xs">backIn</span>
              <span className="text-fluid-xs text-gray-500">引き戻し開始</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-cube3d'} size={40} stroke="pink" ease="backOut" />
              <span className="text-fluid-xs">backOut</span>
              <span className="text-fluid-xs text-gray-500">オーバーシュート</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-cube3d'} size={40} stroke="red" ease="circIn" />
              <span className="text-fluid-xs">circIn</span>
              <span className="text-fluid-xs text-gray-500">円形加速</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow">
              <Icon name={'loading-cube3d'} size={40} stroke="orange" ease="anticipate" />
              <span className="text-fluid-xs">anticipate</span>
              <span className="text-fluid-xs text-gray-500">予備動作</span>
            </div>
          </div>
        </div>

        {/* カード内での使用 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🃏 カード内での使用例</div>
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-fluid-sm font-bold text-blue-800">データ分析中</span>
                <Icon name={'loading-dna'} size={24} stroke="blue" fill="blue" />
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
              </div>
              <p className="text-fluid-xs text-blue-600 mt-2">75% 完了</p>
            </div>

            <div className="rounded-xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-fluid-sm font-bold text-green-800">ファイル検索</span>
                <Icon name={'loading-radar'} size={24} stroke="green" fill="green" />
              </div>
              <p className="text-fluid-xs text-green-600">1,234 件のファイルをスキャン中...</p>
            </div>

            <div className="rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-fluid-sm font-bold text-purple-800">同期中</span>
                <Icon name={'loading-rings'} size={24} stroke="purple" />
              </div>
              <p className="text-fluid-xs text-purple-600">サーバーと同期しています...</p>
            </div>
          </div>
        </div>

        {/* フルスクリーンローディング */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">📺 フルスクリーンローディング例</div>
          <div className="grid grid-cols-2 gap-6">
            <div className="relative h-48 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center">
              <Icon name={'loading-atom'} size={64} stroke="white" fill="white" />
              <p className="text-white text-fluid-sm mt-4">読み込み中...</p>
            </div>
            <div className="relative h-48 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex flex-col items-center justify-center">
              <Icon name={'loading-infinity'} size={64} stroke="white" />
              <p className="text-white text-fluid-sm mt-4">処理を継続中...</p>
            </div>
          </div>
        </div>

        {/* インライン使用 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">📝 テキスト内インライン使用</div>
          <div className="space-y-4">
            <p className="flex items-center text-gray-700">
              <Icon name={'spinner'} size={16} stroke="blue" className="mr-2" />
              データベースに接続しています...
            </p>
            <p className="flex items-center text-gray-700">
              <Icon name={'loading-dna'} size={16} stroke="purple" fill="purple" className="mr-2" />
              遺伝子データを解析中です
            </p>
            <p className="flex items-center text-gray-700">
              <Icon name={'loading-heartbeat'} size={16} stroke="red" className="mr-2" />
              サーバーのヘルスチェック中...
            </p>
            <p className="flex items-center text-gray-700">
              <Icon name={'loading-gears'} size={16} stroke="gray" className="mr-2" />
              設定を適用しています
            </p>
          </div>
        </div>

        {/* フォーム内での使用 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">📋 フォーム内での使用</div>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-fluid-sm font-medium text-gray-700 mb-1">ユーザー名</label>
              <div className="relative">
                <input type="text" className="w-full border rounded-lg px-4 py-2 pr-10" placeholder="入力中..." />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Icon name={'loading-dots'} size={16} stroke="gray" fill="gray" />
                </div>
              </div>
              <p className="text-fluid-xs text-gray-500 mt-1 flex items-center">
                <Icon name={'loading-ripple'} size={12} stroke="blue" className="mr-1" />
                利用可能か確認中...
              </p>
            </div>
            <button className="w-full flex items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-3 text-white" disabled>
              <Icon name={'loading-rings'} size={20} stroke="white" />
              <span>送信中...</span>
            </button>
          </div>
        </div>

        {/* 通知・アラート */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🔔 通知・アラート</div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <Icon name={'loading-ripple'} size={24} stroke="blue" />
              <div>
                <p className="font-medium text-blue-800">接続中</p>
                <p className="text-fluid-sm text-blue-600">サーバーへの接続を確立しています...</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <Icon name={'loading-hourglass'} size={24} stroke="#F59E0B" fill="#F59E0B" />
              <div>
                <p className="font-medium text-yellow-800">処理待ち</p>
                <p className="text-fluid-sm text-yellow-600">順番待ちです。しばらくお待ちください...</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg bg-purple-50 border border-purple-200 p-4">
              <Icon name={'loading-cube3d'} size={24} stroke="purple" />
              <div>
                <p className="font-medium text-purple-800">レンダリング中</p>
                <p className="text-fluid-sm text-purple-600">3Dモデルを生成しています...</p>
              </div>
            </div>
          </div>
        </div>

        {/* タブ・ナビゲーション */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🗂️ タブ・ナビゲーション</div>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <a className="flex items-center space-x-2 border-b-2 border-blue-500 pb-3 text-blue-600">
                <Icon name={'loading-radar'} size={16} stroke="blue" fill="blue" />
                <span>スキャン中</span>
              </a>
              <a className="flex items-center space-x-2 pb-3 text-gray-500">
                <span>完了</span>
              </a>
              <a className="flex items-center space-x-2 pb-3 text-gray-500">
                <span>履歴</span>
              </a>
            </nav>
          </div>
        </div>

        {/* テーブル内 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">📊 テーブル内での使用</div>
          <table className="w-full text-fluid-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">タスク</th>
                <th className="px-4 py-2 text-left">ステータス</th>
                <th className="px-4 py-2 text-left">進捗</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3">データ取得</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <Icon name={'spinner'} size={16} stroke="blue" />
                  <span className="text-blue-600">実行中</span>
                </td>
                <td className="px-4 py-3">45%</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-3">分析処理</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <Icon name={'loading-dna'} size={16} stroke="purple" fill="purple" />
                  <span className="text-purple-600">分析中</span>
                </td>
                <td className="px-4 py-3">12%</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-3">同期</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <Icon name={'loading-rings'} size={16} stroke="green" />
                  <span className="text-green-600">同期中</span>
                </td>
                <td className="px-4 py-3">78%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* バッジ・ラベル */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🏷️ バッジ・ラベル</div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-fluid-sm text-blue-800">
              <Icon name={'spinner'} size={14} stroke="blue" />
              <span>処理中</span>
            </span>
            <span className="inline-flex items-center space-x-1 rounded-full bg-green-100 px-3 py-1 text-fluid-sm text-green-800">
              <Icon name={'loading-ripple'} size={14} stroke="green" />
              <span>接続中</span>
            </span>
            <span className="inline-flex items-center space-x-1 rounded-full bg-purple-100 px-3 py-1 text-fluid-sm text-purple-800">
              <Icon name={'loading-atom'} size={14} stroke="purple" fill="purple" />
              <span>計算中</span>
            </span>
            <span className="inline-flex items-center space-x-1 rounded-full bg-orange-100 px-3 py-1 text-fluid-sm text-orange-800">
              <Icon name={'loading-gears'} size={14} stroke="orange" />
              <span>設定中</span>
            </span>
            <span className="inline-flex items-center space-x-1 rounded-full bg-red-100 px-3 py-1 text-fluid-sm text-red-800">
              <Icon name={'loading-heartbeat'} size={14} stroke="red" />
              <span>監視中</span>
            </span>
            <span className="inline-flex items-center space-x-1 rounded-full bg-yellow-100 px-3 py-1 text-fluid-sm text-yellow-800">
              <Icon name={'loading-hourglass'} size={14} stroke="#F59E0B" fill="#F59E0B" />
              <span>待機中</span>
            </span>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🔢 ステップインジケーター</div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
              <span className="text-fluid-xs mt-2 text-green-600">完了</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Icon name={'loading-dna'} size={20} stroke="white" fill="white" />
              </div>
              <span className="text-fluid-xs mt-2 text-blue-600">分析中</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">3</div>
              <span className="text-fluid-xs mt-2 text-gray-400">確認</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">4</div>
              <span className="text-fluid-xs mt-2 text-gray-400">完了</span>
            </div>
          </div>
        </div>

        {/* モーダル風 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🪟 モーダル風表示</div>
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl bg-white shadow-2xl border p-6">
              <div className="flex flex-col items-center">
                <Icon name={'loading-eclipse'} size={56} stroke="gray" fill="secondary" />
                <p className="font-bold text-fluid-lg mt-4">読み込み中</p>
                <p className="text-fluid-sm text-gray-500 mt-1">データを準備しています...</p>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl p-6">
              <div className="flex flex-col items-center text-white">
                <Icon name={'loading-wave'} size={56} stroke="white" />
                <p className="font-bold text-fluid-lg mt-4">解析中</p>
                <p className="text-fluid-sm text-white/80 mt-1">音声データを処理しています...</p>
              </div>
            </div>
          </div>
        </div>

        {/* グラデーション背景 */}
        <div className="space-y-4 rounded-xl border-2 border-gray-300 bg-white p-6">
          <div className="text-fluid-lg font-bold text-gray-800">🌈 グラデーション背景との組み合わせ</div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
              <Icon name={'loading-infinity'} size={40} stroke="white" />
            </div>
            <div className="h-24 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Icon name={'loading-ripple'} size={40} stroke="white" />
            </div>
            <div className="h-24 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Icon name={'loading-hourglass'} size={40} stroke="white" fill="white" />
            </div>
            <div className="h-24 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <Icon name={'loading-radar'} size={40} stroke="white" fill="white" />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * プリセットの使い方
 * preset を指定するだけで、ローディングアイコンを簡単に表示
 */
export const Presets: Story = {
  parameters: {
    docs: {
      description: {
        story: `
\`preset\` を使うと、\`name\` や \`fill\` を指定せずに簡単にローディングアイコンを表示できます。

\`\`\`tsx
// presetを使用（シンプル）
<Icon preset="cube" />
<Icon preset="cube" size={32} stroke="#10B981" />

// 従来のname指定
<Icon name={'loading-cube3d'} size={32} stroke="#10B981" />
\`\`\`
        `,
      },
    },
  },
  render: function PresetsStory() {
    const presets = [
      { preset: 'spinner', desc: 'シンプルな回転' },
      { preset: 'dots', desc: '3ドットフェード' },
      { preset: 'pulse', desc: '脈動リング' },
      { preset: 'cube', desc: '3Dキューブ' },
      { preset: 'cube-glow', desc: '光る3Dキューブ' },
      { preset: 'interview', desc: '対話アイコン' },
      { preset: 'dna', desc: '二重螺旋' },
      { preset: 'atom', desc: '原子軌道' },
      { preset: 'rings', desc: '多重リング' },
      { preset: 'gears', desc: '歯車回転' },
      { preset: 'hourglass', desc: '砂時計' },
      { preset: 'wave', desc: '音波' },
      { preset: 'radar', desc: 'レーダー' },
      { preset: 'eclipse', desc: '日食' },
      { preset: 'clock', desc: '時計' },
      { preset: 'morph', desc: '変形' },
      { preset: 'orbit', desc: '軌道' },
      { preset: 'triangle', desc: '三角回転' },
      { preset: 'heartbeat', desc: '心拍' },
      // 復元シリーズ
      { preset: 'bars', desc: '4方向バー' },
      { preset: 'wifi', desc: '電波（接続中）' },
      { preset: 'progress', desc: 'プログレスバー' },
      { preset: 'infinity', desc: '無限ループ' },
      { preset: 'ripple', desc: '水紋' },
      { preset: 'star', desc: '輝く星' },
      { preset: 'cross', desc: '2色クロス回転' },
      // 表現拡張
      { preset: 'particles', desc: '12粒子の漂流' },
      { preset: 'comet', desc: '彗星と尾' },
      { preset: 'magnet', desc: 'U字磁石と鉄粉' },
      { preset: 'braid', desc: '3線ブレイド' },
      { preset: 'vortex', desc: '渦への吸い込み' },
      // サプライズ
      { preset: 'prism', desc: 'プリズム分光（虹）' },
    ] as const;

    return (
      <div className="space-y-8 p-4">
        {/* プリセット一覧 */}
        <div>
          <h3 className="mb-4 text-fluid-lg font-bold">プリセット一覧</h3>
          <p className="mb-4 text-fluid-sm text-gray-600">
            <code className="rounded bg-gray-100 px-1">&lt;Icon preset="cube" /&gt;</code> のように使用
          </p>
          <div className="grid grid-cols-4 gap-6">
            {presets.map(({ preset, desc }) => (
              <div key={preset} className="flex flex-col items-center gap-2 rounded-lg border p-4">
                <Icon preset={preset} size={32} />
                <code className="font-mono text-fluid-xs text-blue-600">"{preset}"</code>
                <span className="text-fluid-xs text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* サイズ・色のカスタマイズ */}
        <div>
          <h3 className="mb-4 text-fluid-lg font-bold">カスタマイズ</h3>
          <div className="flex items-end gap-8">
            <div className="flex flex-col items-center gap-2">
              <Icon preset="cube" size={16} />
              <span className="text-fluid-xs">16px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon preset="cube" size={24} />
              <span className="text-fluid-xs">24px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon preset="cube" size={32} stroke="#10B981" />
              <span className="text-fluid-xs">32px + 色</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon preset="cube" size={48} stroke="#8B5CF6" />
              <span className="text-fluid-xs">48px + 色</span>
            </div>
          </div>
        </div>

        {/* 実際の使用例 */}
        <div>
          <h3 className="mb-4 text-fluid-lg font-bold">実際の使用例</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 text-white">
              <Icon preset="spinner" size={16} stroke="white" />
              保存中...
            </button>
            <div className="flex h-24 w-48 flex-col items-center justify-center rounded-lg border bg-gray-50">
              <Icon preset="cube" size={40} stroke="#6B7280" />
              <span className="mt-2 text-fluid-sm text-gray-500">読み込み中</span>
            </div>
            <div className="flex h-24 w-48 flex-col items-center justify-center rounded-lg border bg-emerald-50">
              <Icon preset="interview" size={48} stroke="#10B981" />
              <span className="mt-2 text-fluid-sm text-emerald-600">準備中</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
