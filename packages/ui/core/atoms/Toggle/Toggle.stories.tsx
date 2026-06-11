import { useState } from 'react';

import { Toggle } from './Toggle';

/**
 * トグルスイッチコンポーネント
 *
 * ON/OFFを切り替えるトグルスイッチ。
 * 設定項目やフィーチャーフラグなどに使用します。
 */
export default {
  title: '入力/選択/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Toggleコンポーネント。以下の機能をサポート:

- **2つのバリアント**: default (blue/red), primary (teal/red)
- **3つのサイズ**: small, medium, large
- **ラベル**: オプショナルなラベル表示
- **カスタム角丸**: toggleRadiusで形状を変更可能

設定のON/OFF、フィーチャーフラグ、表示切り替えなどに使用します。
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
      description: 'チェック状態',
      table: { defaultValue: { summary: false } },
    },
    onChange: {
      action: 'changed',
      description: '変更時のコールバック',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'サイズ',
      table: { defaultValue: { summary: 'medium' } },
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary'],
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

// 基本的な使用例
const BasicExample = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Toggle
      label="通知を有効にする"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

export const Basic = {
  render: () => <BasicExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '基本的なトグルスイッチ。ON/OFFを切り替えられます。',
      },
    },
  },
};

// サイズバリエーション
export const Sizes = {
  render: () => (
    <div className="space-y-4">
      <Toggle label="Small" size="small" checked />
      <Toggle label="Medium" size="medium" checked />
      <Toggle label="Large" size="large" checked />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '3つのサイズ（small, medium, large）を比較できます。',
      },
    },
  },
};

// バリアント
export const Variants = {
  render: () => (
    <div className="space-y-4">
      <Toggle label="Default (Blue/Red)" variant="default" checked />
      <Toggle label="Primary (Teal/Red)" variant="primary" checked />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '2つのバリアント（default, primary）を比較できます。',
      },
    },
  },
};

// 無効化
export const Disabled = {
  render: () => (
    <div className="space-y-4">
      <Toggle label="無効化（OFF）" disabled checked={false} />
      <Toggle label="無効化（ON）" disabled checked={true} />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '無効化されたトグル。状態を変更できません。',
      },
    },
  },
};

// ラベルなし
export const WithoutLabel = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Toggle checked={checked} onChange={(e) => setChecked(e.target.checked)} />
    );
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ラベルなしのトグル。アイコンとして使用できます。',
      },
    },
  },
};

// カスタム角丸
export const CustomRadius = {
  render: () => (
    <div className="space-y-4">
      <Toggle label="デフォルト（丸）" checked toggleRadius="9999px" />
      <Toggle label="角丸（8px）" checked toggleRadius="8px" />
      <Toggle label="角丸（4px）" checked toggleRadius="4px" />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'toggleRadiusで角丸をカスタマイズできます。',
      },
    },
  },
};

// 設定画面例
const SettingsExample = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="w-96 rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">設定</h3>
      <div className="space-y-4">
        <Toggle
          label="通知を有効にする"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        <Toggle
          label="ダークモード"
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
        <Toggle
          label="自動保存"
          checked={autoSave}
          onChange={(e) => setAutoSave(e.target.checked)}
        />
      </div>
    </div>
  );
};

export const SettingsPanel = {
  render: () => <SettingsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '設定画面での使用例。複数のトグルスイッチを組み合わせます。',
      },
    },
  },
};

// フィーチャーフラグ例
const FeatureFlagsExample = () => {
  const [features, setFeatures] = useState({
    newDashboard: true,
    experimentalUI: false,
    betaFeatures: false,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-96 rounded-lg bg-gray-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">
        機能フラグ
      </h3>
      <div className="space-y-4">
        <div>
          <Toggle
            label="新しいダッシュボード"
            variant="primary"
            checked={features.newDashboard}
            onChange={() => toggleFeature('newDashboard')}
          />
          <p className="ml-8 mt-1 text-fluid-xs text-gray-600">
            新しいダッシュボードUIを使用します
          </p>
        </div>
        <div>
          <Toggle
            label="実験的UI"
            variant="primary"
            checked={features.experimentalUI}
            onChange={() => toggleFeature('experimentalUI')}
          />
          <p className="ml-8 mt-1 text-fluid-xs text-gray-600">
            最新の実験的な機能を試せます
          </p>
        </div>
        <div>
          <Toggle
            label="ベータ機能"
            variant="primary"
            checked={features.betaFeatures}
            onChange={() => toggleFeature('betaFeatures')}
          />
          <p className="ml-8 mt-1 text-fluid-xs text-gray-600">
            ベータ版の機能にアクセスできます
          </p>
        </div>
      </div>
    </div>
  );
};

export const FeatureFlags = {
  render: () => <FeatureFlagsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '機能フラグ管理画面の例。説明テキスト付き。',
      },
    },
  },
};

// 全状態比較
export const AllStates = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold">Default Variant</h4>
        <div className="space-y-2">
          <Toggle label="OFF" variant="default" checked={false} />
          <Toggle label="ON" variant="default" checked={true} />
          <Toggle label="OFF (Disabled)" variant="default" checked={false} disabled />
          <Toggle label="ON (Disabled)" variant="default" checked={true} disabled />
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold">Primary Variant</h4>
        <div className="space-y-2">
          <Toggle label="OFF" variant="primary" checked={false} />
          <Toggle label="ON" variant="primary" checked={true} />
          <Toggle label="OFF (Disabled)" variant="primary" checked={false} disabled />
          <Toggle label="ON (Disabled)" variant="primary" checked={true} disabled />
        </div>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'すべてのバリアントと状態を一覧表示。',
      },
    },
  },
};
