import { useState, type ComponentProps } from 'react';

import { Checkbox } from './Checkbox';

type CheckboxProps = ComponentProps<typeof Checkbox>;

export default {
  title: '入力/選択/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'チェックボックスコンポーネント。サイズ、バリアント、ラベルの有無などをカスタマイズできます。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'チェックボックスに表示するラベル',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'チェックボックスのサイズ',
      table: { defaultValue: { summary: 'medium' } },
    },
    variant: {
      control: 'select',
      options: ['default', 'primary'],
      description: 'チェックボックスのバリアント',
      table: { defaultValue: { summary: 'default' } },
    },
    checked: {
      control: 'boolean',
      description: 'チェック状態',
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

// インタラクティブなストーリー用のテンプレート
const Template = (args: CheckboxProps) => {
  const [checked, setChecked] = useState(args.checked || false);
  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={(e) => {
        setChecked(e.target.checked);
        if (args.onChange) args.onChange(e);
      }}
    />
  );
};

export const Default = {
  render: Template,
  args: {},
  parameters: {
    docs: {
      description: { story: '基本的なチェックボックス' },
    },
  },
};

export const WithLabel = {
  render: Template,
  args: {
    label: '利用規約に同意する',
  },
  parameters: {
    docs: {
      description: { story: 'ラベル付きチェックボックス' },
    },
  },
};

export const Checked = {
  render: Template,
  args: {
    checked: true,
    label: 'チェック済み',
  },
  parameters: {
    docs: {
      description: { story: 'チェック済み状態のチェックボックス' },
    },
  },
};

export const Sizes = {
  render: () => {
    const [checkedSmall, setCheckedSmall] = useState(true);
    const [checkedMedium, setCheckedMedium] = useState(true);
    const [checkedLarge, setCheckedLarge] = useState(true);

    return (
      <div className="flex flex-col gap-4">
        <Checkbox
          size="small"
          label="Small サイズ"
          checked={checkedSmall}
          onChange={(e) => setCheckedSmall(e.target.checked)}
        />
        <Checkbox
          size="medium"
          label="Medium サイズ（デフォルト）"
          checked={checkedMedium}
          onChange={(e) => setCheckedMedium(e.target.checked)}
        />
        <Checkbox
          size="large"
          label="Large サイズ"
          checked={checkedLarge}
          onChange={(e) => setCheckedLarge(e.target.checked)}
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
    const [checkedDefault, setCheckedDefault] = useState(true);
    const [checkedPrimary, setCheckedPrimary] = useState(true);

    return (
      <div className="flex flex-col gap-4">
        <Checkbox
          variant="default"
          label="Default バリアント（青）"
          checked={checkedDefault}
          onChange={(e) => setCheckedDefault(e.target.checked)}
        />
        <Checkbox
          variant="primary"
          label="Primary バリアント（ティール）"
          checked={checkedPrimary}
          onChange={(e) => setCheckedPrimary(e.target.checked)}
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
      <Checkbox disabled label="無効（未チェック）" />
      <Checkbox disabled checked label="無効（チェック済み）" />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: '無効化状態のチェックボックス' },
    },
  },
};

export const WithoutLabel = {
  render: () => {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);
    const [checked3, setChecked3] = useState(false);

    return (
      <div className="flex items-center gap-4">
        <Checkbox
          checked={checked1}
          onChange={(e) => setChecked1(e.target.checked)}
        />
        <Checkbox
          checked={checked2}
          onChange={(e) => setChecked2(e.target.checked)}
        />
        <Checkbox
          checked={checked3}
          onChange={(e) => setChecked3(e.target.checked)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'ラベルなしのチェックボックス（テーブル等で使用）' },
    },
  },
};

export const Interactive = {
  render: () => {
    const [options, setOptions] = useState({
      option1: false,
      option2: true,
      option3: false,
    });

    const handleChange = (key: keyof typeof options) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setOptions((prev) => ({ ...prev, [key]: e.target.checked }));
    };

    const allChecked = Object.values(options).every(Boolean);
    const someChecked = Object.values(options).some(Boolean) && !allChecked;

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setOptions({
        option1: checked,
        option2: checked,
        option3: checked,
      });
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="border-b pb-2">
          <Checkbox
            label="すべて選択"
            checked={allChecked}
            onChange={handleSelectAll}
            className={someChecked ? 'opacity-70' : ''}
          />
        </div>
        <div className="ml-4 flex flex-col gap-2">
          <Checkbox
            label="オプション 1"
            checked={options.option1}
            onChange={handleChange('option1')}
          />
          <Checkbox
            label="オプション 2"
            checked={options.option2}
            onChange={handleChange('option2')}
          />
          <Checkbox
            label="オプション 3"
            checked={options.option3}
            onChange={handleChange('option3')}
          />
        </div>
        <div className="mt-2 text-fluid-sm text-gray-600">
          選択中: {Object.values(options).filter(Boolean).length} / 3
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: '複数選択と全選択の連動例' },
    },
  },
};
