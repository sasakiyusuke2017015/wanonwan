import { useState, type ComponentProps } from 'react';

import { Slider } from './Slider';

type SliderProps = ComponentProps<typeof Slider>;

/**
 * スライダーコンポーネント
 *
 * 数値の範囲選択を行うスライダー。
 * 音量調整や設定値の変更などに使用します。
 */
export default {
  title: '入力/選択/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Sliderコンポーネント。以下の機能をサポート:

- **範囲指定**: min, max, stepで値の範囲を制御
- **ラベル表示**: ラベルと現在値を表示
- **カスタムフォーマット**: formatValueで表示形式を変更
- **無効化**: disabled状態をサポート

音量調整、明るさ設定、パラメータ調整などに使用します。
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: '現在の値',
    },
    onChange: {
      action: 'changed',
      description: '値変更時のコールバック',
    },
    min: {
      control: 'number',
      description: '最小値',
      table: { defaultValue: { summary: 0 } },
    },
    max: {
      control: 'number',
      description: '最大値',
      table: { defaultValue: { summary: 100 } },
    },
    step: {
      control: 'number',
      description: 'ステップ',
      table: { defaultValue: { summary: 1 } },
    },
    label: {
      control: 'text',
      description: 'ラベル',
    },
    disabled: {
      control: 'boolean',
      description: '無効化',
      table: { defaultValue: { summary: false } },
    },
  },
};

// 基本的な使用例
const BasicExample = () => {
  const [value, setValue] = useState(50);

  return (
    <div className="w-80">
      <Slider value={value} onChange={setValue} label="音量" />
    </div>
  );
};

export const Basic = {
  render: () => <BasicExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '基本的なスライダー。0-100の範囲で値を選択できます。',
      },
    },
  },
};

// パーセント表示
const PercentExample = () => {
  const [value, setValue] = useState(75);

  return (
    <div className="w-80">
      <Slider
        value={value}
        onChange={setValue}
        label="進捗"
        formatValue={(v) => `${v}%`}
      />
    </div>
  );
};

export const Percent = {
  render: () => <PercentExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'formatValueで値を%表示にカスタマイズ。',
      },
    },
  },
};

// カスタム範囲
const CustomRangeExample = () => {
  const [value, setValue] = useState(3);

  return (
    <div className="w-80">
      <Slider
        value={value}
        onChange={setValue}
        min={1}
        max={5}
        step={1}
        label="評価"
        formatValue={(v) => `${v} / 5`}
      />
    </div>
  );
};

export const CustomRange = {
  render: () => <CustomRangeExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'min=1, max=5のカスタム範囲。評価入力などに使用できます。',
      },
    },
  },
};

// ステップ指定
const StepExample = () => {
  const [value, setValue] = useState(50);

  return (
    <div className="w-80">
      <Slider
        value={value}
        onChange={setValue}
        step={10}
        label="明るさ"
        formatValue={(v) => `${v}%`}
      />
    </div>
  );
};

export const WithStep = {
  render: () => <StepExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'step=10で10刻みで値を変更できます。',
      },
    },
  },
};

// 無効化
export const Disabled = {
  args: {
    value: 60,
    onChange: () => {},
    label: '固定値',
    disabled: true,
  },
  render: (args: SliderProps) => (
    <div className="w-80">
      <Slider {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '無効化されたスライダー。値を変更できません。',
      },
    },
  },
};

// 複数スライダー
const MultipleSliders = () => {
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(80);
  const [contrast, setContrast] = useState(50);

  return (
    <div className="w-96 space-y-6 rounded-lg bg-white p-6 shadow">
      <h3 className="text-fluid-lg font-semibold text-gray-800">表示設定</h3>
      <Slider
        value={volume}
        onChange={setVolume}
        label="音量"
        formatValue={(v) => `${v}%`}
      />
      <Slider
        value={brightness}
        onChange={setBrightness}
        label="明るさ"
        formatValue={(v) => `${v}%`}
      />
      <Slider
        value={contrast}
        onChange={setContrast}
        label="コントラスト"
        formatValue={(v) => `${v}%`}
      />
    </div>
  );
};

export const MultipleSettings = {
  render: () => <MultipleSliders />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '複数のスライダーを組み合わせた設定画面の例。',
      },
    },
  },
};

// 価格範囲
const PriceRangeExample = () => {
  const [price, setPrice] = useState(5000);

  return (
    <div className="w-96 rounded-lg bg-gray-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">価格フィルター</h3>
      <Slider
        value={price}
        onChange={setPrice}
        min={0}
        max={10000}
        step={500}
        label="最大価格"
        formatValue={(v) => `¥${v.toLocaleString()}`}
      />
      <div className="mt-4 text-fluid-sm text-gray-600">
        {price.toLocaleString()}円以下の商品を表示
      </div>
    </div>
  );
};

export const PriceRange = {
  render: () => <PriceRangeExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '価格範囲フィルターとして使用する例。',
      },
    },
  },
};

// 温度設定
const TemperatureExample = () => {
  const [temp, setTemp] = useState(22);

  return (
    <div className="w-80 rounded-lg bg-blue-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-blue-800">室温設定</h3>
      <Slider
        value={temp}
        onChange={setTemp}
        min={16}
        max={30}
        step={0.5}
        label="目標温度"
        formatValue={(v) => `${v}°C`}
      />
    </div>
  );
};

export const Temperature = {
  render: () => <TemperatureExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '温度設定の例。step=0.5で小数点以下も設定可能。',
      },
    },
  },
};
