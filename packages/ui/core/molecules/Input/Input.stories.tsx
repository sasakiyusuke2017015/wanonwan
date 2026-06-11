import React, { useState, type ComponentProps } from 'react';

import { Input } from './Input';

type InputProps = ComponentProps<typeof Input>;

export default {
  title: '入力/テキスト/Input',
  component: Input,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ZTvv6vzLXOxlP64TLs6YHB/%E7%84%A1%E9%A1%8C?t=uGI62GQBWdy1FqLU-0',
    },
    layout: 'centered',
    docs: {
      description: {
        component:
          '汎用的な入力フィールドコンポーネント。テキスト、パスワード、メール、数値など様々な入力タイプに対応しています。',
      },
      source: {
        transform: (code: string, storyContext: { args: Record<string, unknown> }) => {
          const { args } = storyContext;
          const props = [];

          if (args.type && args.type !== 'text') {
            props.push(`type="${args.type}"`);
          }
          if (args.placeholder) {
            props.push(`placeholder="${args.placeholder}"`);
          }
          if (args.value) {
            props.push(`value="${args.value}"`);
          } else if (args.defaultValue) {
            props.push(`defaultValue="${args.defaultValue}"`);
          }
          if (args.disabled) {
            props.push('disabled');
          }
          // className は必ずベースクラスを含める
          const cn = ['sdt-input', args.className].filter(Boolean).join(' ');
          props.push(`className="${cn}"`);

          if (args.onChange) {
            props.push('onChange={handleChange}');
          }

          const propsString = props.length > 0 ? ' ' + props.join(' ') : '';
          return `import { Input } from './components/atoms/Input/Input';

<Input${propsString} />`;
        },
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
      description: '入力フィールドのタイプ',
      table: { defaultValue: { summary: 'text' } },
    },
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
    disabled: {
      control: 'boolean',
      description: '無効化状態',
    },
    className: {
      control: 'text',
      description: '追加のCSSクラス(sdt-inputを含めない)',
    },
    onChange: { action: 'changed' },
    onKeyDown: { action: 'keyPressed' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' },
  },
};

// stateful wrapper for interactive stories
const Template = (args: InputProps) => {
  const [value, setValue] = useState(args.defaultValue || '');
  return (
    <Input
      {...args}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        if (args.onChange) args.onChange(e);
      }}
    />
  );
};

export const Default = {
  render: Template,
  args: {
    placeholder: 'テキストを入力してください',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '基本的なテキスト入力フィールド' },
    },
  },
};

export const WithValue = {
  render: Template,
  args: {
    defaultValue: '入力済みのテキスト',
    placeholder: 'テキストを入力してください',
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '初期値が設定された入力フィールド' },
    },
  },
};

export const Password = {
  render: Template,
  args: {
    type: 'password',
    placeholder: 'パスワードを入力してください',
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'パスワード入力用フィールド(文字がマスクされます)',
      },
    },
  },
};

export const Email = {
  render: Template,
  args: {
    type: 'email',
    placeholder: 'メールアドレスを入力してください',
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'メールアドレス入力用フィールド(ブラウザのバリデーション機能付き)',
      },
    },
  },
};

export const Number = {
  render: Template,
  args: {
    type: 'number',
    placeholder: '数値を入力してください',
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story: '数値入力用フィールド(スピナーコントロール付き)',
      },
    },
  },
};

export const Disabled = {
  render: Template,
  args: {
    value: '編集不可のテキスト',
    disabled: true,
    className: '',
  },
  parameters: {
    docs: {
      description: { story: '無効化された入力フィールド(操作不可)' },
    },
  },
};

export const CustomStyle = {
  render: Template,
  args: {
    placeholder: 'カスタムスタイル付き',
    className: 'border-blue-500 focus:ring-blue-500',
  },
  parameters: {
    docs: {
      description: { story: 'カスタムCSSクラスでスタイルをカスタマイズした例' },
    },
  },
};
