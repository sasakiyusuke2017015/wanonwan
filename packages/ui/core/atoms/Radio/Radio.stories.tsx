import { useState } from 'react';

import { Radio } from './Radio';

export default {
  title: '入力/選択/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ラジオボタンコンポーネント。サイズ、バリアント、ラベルの有無などをカスタマイズできます。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'ラジオボタンに表示するラベル',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'ラジオボタンのサイズ',
      table: { defaultValue: { summary: 'medium' } },
    },
    variant: {
      control: 'select',
      options: ['default', 'primary'],
      description: 'ラジオボタンのバリアント',
      table: { defaultValue: { summary: 'default' } },
    },
    checked: {
      control: 'boolean',
      description: '選択状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効化状態',
    },
    className: {
      control: 'text',
      description: '追加のCSSクラス',
    },
    onChange: { action: 'changed' },
  },
};

export const Default = {
  args: {},
  parameters: {
    docs: {
      description: { story: '基本的なラジオボタン' },
    },
  },
};

export const WithLabel = {
  args: {
    label: 'オプション1',
    name: 'option',
  },
  parameters: {
    docs: {
      description: { story: 'ラベル付きラジオボタン' },
    },
  },
};

export const Checked = {
  args: {
    checked: true,
    label: '選択済み',
    name: 'checked-option',
    readOnly: true,
  },
  parameters: {
    docs: {
      description: { story: '選択済み状態のラジオボタン' },
    },
  },
};

export const Sizes = {
  render: () => {
    const [selected, setSelected] = useState('medium');

    return (
      <div className="flex flex-col gap-4">
        <Radio
          size="small"
          label="Small サイズ"
          name="size-demo"
          value="small"
          checked={selected === 'small'}
          onChange={() => setSelected('small')}
        />
        <Radio
          size="medium"
          label="Medium サイズ（デフォルト）"
          name="size-demo"
          value="medium"
          checked={selected === 'medium'}
          onChange={() => setSelected('medium')}
        />
        <Radio
          size="large"
          label="Large サイズ"
          name="size-demo"
          value="large"
          checked={selected === 'large'}
          onChange={() => setSelected('large')}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'サイズバリエーション（small, medium, large）' },
    },
  },
};

export const Variants = {
  render: () => {
    const [selected, setSelected] = useState('default');

    return (
      <div className="flex flex-col gap-4">
        <Radio
          variant="default"
          label="Default バリアント（青）"
          name="variant-demo"
          value="default"
          checked={selected === 'default'}
          onChange={() => setSelected('default')}
        />
        <Radio
          variant="primary"
          label="Primary バリアント（ティール）"
          name="variant-demo"
          value="primary"
          checked={selected === 'primary'}
          onChange={() => setSelected('primary')}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'バリアントによる色の違い' },
    },
  },
};

export const Disabled = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Radio disabled label="無効（未選択）" name="disabled-demo-1" />
      <Radio disabled checked label="無効（選択済み）" name="disabled-demo-2" readOnly />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: '無効化状態のラジオボタン' },
    },
  },
};

export const RadioGroup = {
  render: () => {
    const [selected, setSelected] = useState('option2');

    const options = [
      { value: 'option1', label: 'オプション 1' },
      { value: 'option2', label: 'オプション 2' },
      { value: 'option3', label: 'オプション 3' },
      { value: 'option4', label: 'オプション 4（無効）', disabled: true },
    ];

    return (
      <div className="flex flex-col gap-3">
        <p className="text-fluid-sm font-medium text-gray-700">お好みのオプションを選択してください：</p>
        {options.map((option) => (
          <Radio
            key={option.value}
            name="radio-group"
            value={option.value}
            label={option.label}
            checked={selected === option.value}
            onChange={() => setSelected(option.value)}
            disabled={option.disabled}
          />
        ))}
        <p className="mt-2 text-fluid-sm text-gray-600">
          選択中: {options.find(o => o.value === selected)?.label || '未選択'}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'ラジオボタングループの例' },
    },
  },
};
