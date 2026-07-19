import { useState } from 'react';

import { Switch } from './Switch';

/**
 * トグルスイッチコンポーネント (boolean トグルの正準)
 *
 * ON/OFFを切り替えるトグルスイッチ。
 * 設定項目や公開状態、フィーチャーフラグなどに使用します。
 */
export default {
  title: '入力/選択/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Switchコンポーネント。boolean トグルの正準実装 (ui-architecture.md §3)。以下の機能をサポート:

- **3つのバリアント**: default (blue/red), primary (teal/red), neutral (green/gray)
- **3つのサイズ**: small, medium, large
- **ラベル**: オプショナルなラベル表示
- **カスタム角丸**: toggleRadiusで形状を変更可能
- **生値 API**: onChange は event でなく次の boolean 値を受け取る

設定のON/OFF、公開状態、フィーチャーフラグ、表示切り替えなどに使用します。
OFF を「エラー」ではなく中立として見せたい場合 (公開/有効化トグル等) は neutral を使います。
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'ラベルテキスト',
    },
    checked: {
      control: 'boolean',
      description: 'ON/OFF 状態 (controlled)',
    },
    onChange: {
      action: 'changed',
      description: '変更後の値を生値で受け取るコールバック',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'サイズ',
      table: { defaultValue: { summary: 'medium' } },
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'neutral'],
      description: 'バリアント',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: '無効化',
      table: { defaultValue: { summary: false } },
    },
    toggleRadius: {
      control: 'text',
      description: 'トグルスイッチの角丸',
    },
  },
};

// 基本的な使用例 (controlled)
const BasicExample = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Switch
      label="通知を有効化"
      checked={checked}
      onChange={setChecked}
    />
  );
};

export const Basic = {
  render: () => <BasicExample />,
};

// サイズ
export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Switch label="Small" size="small" checked onChange={() => {}} />
      <Switch label="Medium" size="medium" checked onChange={() => {}} />
      <Switch label="Large" size="large" checked onChange={() => {}} />
    </div>
  ),
};

// バリアント
export const Variants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Switch label="Default (ON 青 / OFF 赤)" variant="default" checked onChange={() => {}} />
      <Switch label="Primary (ON teal / OFF 赤)" variant="primary" checked onChange={() => {}} />
      <Switch label="Neutral (ON 緑 / OFF 灰)" variant="neutral" checked onChange={() => {}} />
      <Switch label="Neutral OFF" variant="neutral" checked={false} onChange={() => {}} />
    </div>
  ),
};

// 無効化
export const Disabled = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Switch label="無効化（OFF）" disabled checked={false} onChange={() => {}} />
      <Switch label="無効化（ON）" disabled checked={true} onChange={() => {}} />
    </div>
  ),
};

// カスタム角丸
export const CustomRadius = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Switch label="デフォルト（丸）" checked onChange={() => {}} />
      <Switch label="角丸 8px" checked toggleRadius="8px" onChange={() => {}} />
    </div>
  ),
};
