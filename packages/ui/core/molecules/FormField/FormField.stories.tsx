import { FormField } from './FormField';

export default {
  title: 'フォーム/フィールド/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'フィールドのラベル',
    },
    error: {
      control: 'text',
      description: 'エラーメッセージ',
    },
    required: {
      control: 'boolean',
      description: '必須項目かどうか',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel'],
      description: '入力タイプ',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
  },
};

// デフォルト状態
export const Default = {
  args: {
    label: 'お名前',
    placeholder: 'お名前を入力してください',
  },
};

// 必須項目
export const Required = {
  args: {
    label: 'メールアドレス',
    type: 'email',
    placeholder: 'example@example.com',
    required: true,
  },
};

// エラー状態
export const WithError = {
  args: {
    label: 'パスワード',
    type: 'password',
    placeholder: 'パスワードを入力',
    required: true,
    error: 'パスワードは8文字以上で入力してください',
  },
};

// 数値入力
export const NumberInput = {
  args: {
    label: '年齢',
    type: 'number',
    placeholder: '年齢を入力',
    required: true,
  },
};

// 電話番号
export const PhoneInput = {
  args: {
    label: '電話番号',
    type: 'tel',
    placeholder: '090-1234-5678',
  },
};

// ラベルなし
export const WithoutLabel = {
  args: {
    placeholder: 'ラベルなしの入力フィールド',
  },
};

// question バリアント（必須）
export const QuestionRequired = {
  args: {
    variant: 'question',
    label: 'お名前を教えてください',
    description: 'フルネームでご記入ください。',
    placeholder: '山田 太郎',
    required: true,
  },
};

// question バリアント（任意）
export const QuestionOptional = {
  args: {
    variant: 'question',
    label: 'ご意見・ご要望',
    description: '改善してほしい点があれば自由にご記入ください。',
    placeholder: '自由にご記入ください',
  },
};

// question バリアント（エラー）
export const QuestionWithError = {
  args: {
    variant: 'question',
    label: 'メールアドレス',
    description: '確認メールの送信先として使用します。',
    type: 'email',
    placeholder: 'example@example.com',
    required: true,
    error: '有効なメールアドレスを入力してください',
  },
};
