import React, { useState, type ComponentProps } from 'react';

import { TextArea } from './TextArea';

type TextAreaProps = ComponentProps<typeof TextArea>;

export default {
  title: '入力/テキスト/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '複数行のテキスト入力が可能なテキストエリアコンポーネント。メモや説明文など長文の入力に対応しています。',
      },
      source: {
        transform: (code: string, storyContext: { args: Record<string, unknown> }) => {
          const { args } = storyContext;
          const props = [];

          if (args.placeholder) {
            props.push(`placeholder="${args.placeholder}"`);
          }
          if (args.value) {
            props.push(`value="${args.value}"`);
          } else if (args.defaultValue) {
            props.push(`defaultValue="${args.defaultValue}"`);
          }
          if (args.rows && args.rows !== 4) {
            props.push(`rows={${args.rows}}`);
          }
          if (args.disabled) {
            props.push('disabled');
          }
          if (args.error) {
            props.push('error');
          }
          if (args.variant && args.variant !== 'default') {
            props.push(`variant="${args.variant}"`);
          }
          if (args.size && args.size !== 'medium') {
            props.push(`size="${args.size}"`);
          }
          // className は必ずベースクラスを含める
          const cn = ['sdt-textarea', args.className].filter(Boolean).join(' ');
          props.push(`className="${cn}"`);

          if (args.onChange) {
            props.push('onChange={handleChange}');
          }

          const propsString = props.length > 0 ? ' ' + props.join(' ') : '';
          return `import { TextArea } from './components/atoms/TextArea/TextArea';

<TextArea${propsString} />`;
        },
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    value: {
      control: 'text',
      description: '入力値(制御されたコンポーネント)',
    },
    defaultValue: {
      control: 'text',
      description: '初期値(非制御コンポーネント)',
    },
    rows: {
      control: 'number',
      description: '表示行数',
      table: { defaultValue: { summary: '4' } },
    },
    variant: {
      control: 'select',
      options: ['default', 'dark', 'outlined'],
      description: 'スタイルバリアント',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'サイズ',
      table: { defaultValue: { summary: 'medium' } },
    },
    error: {
      control: 'boolean',
      description: 'エラー状態',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: '無効化状態',
    },
    className: {
      control: 'text',
      description: '追加のCSSクラス(sdt-textareaを含めない)',
    },
    onChange: { action: 'changed' },
    onKeyDown: { action: 'keyPressed' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' },
  },
};

// stateful wrapper for interactive stories
const Template = (args: TextAreaProps) => {
  const [value, setValue] = useState(args.defaultValue || '');
  return (
    <div className="w-96">
      <TextArea
        {...args}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (args.onChange) args.onChange(e);
        }}
      />
    </div>
  );
};

export const Default = {
  render: Template,
  args: {
    placeholder: 'テキストを入力してください...',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '基本的なテキストエリア' },
    },
  },
};

export const WithValue = {
  render: Template,
  args: {
    defaultValue: '入力済みのテキスト\n複数行のテキストが入力できます。',
    placeholder: 'テキストを入力してください...',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '初期値が設定されたテキストエリア' },
    },
  },
};

export const WithError = {
  render: Template,
  args: {
    placeholder: 'エラー状態のテキストエリア',
    error: true,
    className: '',
  },
  parameters: {
    docs: {
      description: { story: 'エラー状態のテキストエリア(赤い枠線で表示)' },
    },
  },
};

export const CustomRows = {
  render: Template,
  args: {
    placeholder: '表示行数を変更した例',
    rows: 8,
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '表示行数を8行に設定した例' },
    },
  },
};

export const SmallSize = {
  render: Template,
  args: {
    placeholder: '小サイズのテキストエリア',
    size: 'small',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '小サイズのテキストエリア' },
    },
  },
};

export const LargeSize = {
  render: Template,
  args: {
    placeholder: '大サイズのテキストエリア',
    size: 'large',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '大サイズのテキストエリア' },
    },
  },
};

export const DarkVariant = {
  render: Template,
  args: {
    placeholder: 'ダークテーマのテキストエリア',
    variant: 'dark',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: 'ダークテーマスタイルのテキストエリア' },
    },
    backgrounds: { default: 'dark' },
  },
};

export const OutlinedVariant = {
  render: Template,
  args: {
    placeholder: 'アウトラインスタイルのテキストエリア',
    variant: 'outlined',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: 'アウトラインスタイルのテキストエリア' },
    },
  },
};

export const Disabled = {
  render: Template,
  args: {
    value: '編集不可のテキスト\n複数行のテキストです。',
    disabled: true,
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '無効化されたテキストエリア(操作不可)' },
    },
  },
};

const WithFormFieldComponent = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  return (
    <div className="w-96">
      <label
        htmlFor="interview-memo"
        className="mb-2 block text-fluid-sm font-medium text-gray-700"
      >
        面談メモ
        <span className="ml-1 text-red-500">*</span>
      </label>
      <TextArea
        id="interview-memo"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(e.target.value.length === 0);
        }}
        placeholder="面談の内容やメモを入力してください..."
        error={error}
        rows={4}
      />
      {error && <p className="mt-1 text-fluid-sm text-red-600">この項目は必須です</p>}
    </div>
  );
};

export const WithFormField = {
  render: () => <WithFormFieldComponent />,
  parameters: {
    docs: {
      description: {
        story: 'FormFieldと組み合わせた実用例（ラベルとエラーメッセージ付き）',
      },
    },
  },
};
