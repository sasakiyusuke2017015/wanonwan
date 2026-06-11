import { useState } from 'react';

import { Segment } from './Segment';


/**
 * Segment（セグメントコントロール）コンポーネント
 *
 * 複数の選択肢から1つを選ぶセグメントコントロール。
 * 立体的なデザインと滑らかなアニメーションを備えています。
 */
export default {
  title: '入力/選択/Segment',
  component: Segment,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Segmentコンポーネント。以下の機能をサポート:

- **framer-motion アニメーション**: 滑らかなスプリングアニメーション
- **等間隔幅**: ボタンが均等に配置
- **Green系統の立体的デザイン**: 多層シャドウとグラデーション
- **アイコン + ラベル表示**: アイコンとテキストの組み合わせ可能
- **完全な左右対称アニメーション**: 自然な動き
- **3つのサイズ**: small, medium, large

表示モード切り替え、フィルター選択、タブUIなどに使用します。
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: '現在選択されている値',
    },
    onChange: {
      action: 'changed',
      description: '値変更時のコールバック',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'サイズ',
      table: { defaultValue: { summary: 'medium' } },
    },
    disabled: {
      control: 'boolean',
      description: '無効化',
      table: { defaultValue: { summary: false } },
    },
    borderRadius: {
      control: 'text',
      description: '角丸',
    },
  },
};

// 基本的な使用例（2つの選択肢）
const BasicExample = () => {
  const [viewMode, setViewMode] = useState('table');

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold">表示モード切り替え</h4>
        <Segment
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'table', label: 'テーブル', icon: 'list' },
            { value: 'card', label: 'カード', icon: 'dashboard' },
          ]}
          size="medium"
        />
      </div>
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-fluid-sm text-gray-600">
          現在の表示モード: <span className="font-semibold">{viewMode}</span>
        </p>
      </div>
    </div>
  );
};

export const Basic = {
  render: () => <BasicExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: `
基本的なセグメントコントロール。2つの選択肢（テーブル/カード）を切り替えます。

特徴:
- framer-motionによる滑らかなアニメーション
- 等間隔幅のボタン配置
- Green系統の立体的なデザイン
- アイコン + ラベル表示対応
- 完全な左右対称アニメーション
        `,
      },
    },
  },
};

// 3つの選択肢
const ThreeOptionsExample = () => {
  const [mode, setMode] = useState('list');

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold">表示形式</h4>
        <Segment
          value={mode}
          onChange={setMode}
          options={[
            { value: 'list', label: 'リスト', icon: 'list' },
            { value: 'grid', label: 'グリッド', icon: 'dashboard' },
            { value: 'timeline', label: 'タイムライン', icon: 'calendar' },
          ]}
          size="medium"
        />
      </div>
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-fluid-sm text-gray-600">
          選択中: <span className="font-semibold">{mode}</span>
        </p>
      </div>
    </div>
  );
};

export const ThreeOptions = {
  render: () => <ThreeOptionsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '3つの選択肢を持つセグメントコントロール。左右対称なアニメーションを確認できます。',
      },
    },
  },
};

// サイズ比較
export const Sizes = {
  render: () => {
    const [small, setSmall] = useState('option1');
    const [medium, setMedium] = useState('option1');
    const [large, setLarge] = useState('option1');

    return (
      <div className="space-y-6">
        <div>
          <h4 className="mb-2 text-fluid-sm font-semibold">Small</h4>
          <Segment
            value={small}
            onChange={setSmall}
            options={[
              { value: 'option1', label: 'オプション1' },
              { value: 'option2', label: 'オプション2' },
            ]}
            size="small"
          />
        </div>
        <div>
          <h4 className="mb-2 text-fluid-sm font-semibold">Medium</h4>
          <Segment
            value={medium}
            onChange={setMedium}
            options={[
              { value: 'option1', label: 'オプション1' },
              { value: 'option2', label: 'オプション2' },
            ]}
            size="medium"
          />
        </div>
        <div>
          <h4 className="mb-2 text-fluid-sm font-semibold">Large</h4>
          <Segment
            value={large}
            onChange={setLarge}
            options={[
              { value: 'option1', label: 'オプション1' },
              { value: 'option2', label: 'オプション2' },
            ]}
            size="large"
          />
        </div>
      </div>
    );
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'セグメントコントロールの3つのサイズ（small, medium, large）を比較できます。',
      },
    },
  },
};

// アイコンなし
const NoIconExample = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold">フィルター</h4>
        <Segment
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'すべて' },
            { value: 'active', label: 'アクティブ' },
            { value: 'archived', label: 'アーカイブ' },
          ]}
          size="medium"
        />
      </div>
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-fluid-sm text-gray-600">
          フィルター: <span className="font-semibold">{filter}</span>
        </p>
      </div>
    </div>
  );
};

export const NoIcon = {
  render: () => <NoIconExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'アイコンなしのセグメントコントロール。テキストのみで表示します。',
      },
    },
  },
};

// 無効化
export const Disabled = {
  render: () => {
    const [value, setValue] = useState('option1');

    return (
      <div className="space-y-4">
        <Segment
          value={value}
          onChange={setValue}
          options={[
            { value: 'option1', label: 'オプション1' },
            { value: 'option2', label: 'オプション2' },
          ]}
          size="medium"
          disabled
        />
      </div>
    );
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '無効化されたセグメントコントロール。選択を変更できません。',
      },
    },
  },
};

// カスタム角丸
export const CustomRadius = {
  render: () => {
    const [value1, setValue1] = useState('option1');
    const [value2, setValue2] = useState('option1');
    const [value3, setValue3] = useState('option1');

    return (
      <div className="space-y-6">
        <div>
          <h4 className="mb-2 text-fluid-sm font-semibold">デフォルト（0.375rem）</h4>
          <Segment
            value={value1}
            onChange={setValue1}
            options={[
              { value: 'option1', label: 'オプション1' },
              { value: 'option2', label: 'オプション2' },
            ]}
            size="medium"
          />
        </div>
        <div>
          <h4 className="mb-2 text-fluid-sm font-semibold">角丸（8px）</h4>
          <Segment
            value={value2}
            onChange={setValue2}
            options={[
              { value: 'option1', label: 'オプション1' },
              { value: 'option2', label: 'オプション2' },
            ]}
            size="medium"
            borderRadius="8px"
          />
        </div>
        <div>
          <h4 className="mb-2 text-fluid-sm font-semibold">完全な丸（50px）</h4>
          <Segment
            value={value3}
            onChange={setValue3}
            options={[
              { value: 'option1', label: 'オプション1' },
              { value: 'option2', label: 'オプション2' },
            ]}
            size="medium"
            borderRadius="50px"
          />
        </div>
      </div>
    );
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'borderRadiusで角丸をカスタマイズできます。',
      },
    },
  },
};

// 実践例: 設定パネル
const SettingsPanelExample = () => {
  const [viewMode, setViewMode] = useState('table');
  const [sortOrder, setSortOrder] = useState('asc');
  const [groupBy, setGroupBy] = useState('none');

  return (
    <div className="w-96 rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">表示設定</h3>
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-fluid-sm font-medium text-gray-700">表示モード</label>
          <Segment
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'table', label: 'テーブル', icon: 'list' },
              { value: 'card', label: 'カード', icon: 'dashboard' },
            ]}
            size="medium"
          />
        </div>
        <div>
          <label className="mb-2 block text-fluid-sm font-medium text-gray-700">並び順</label>
          <Segment
            value={sortOrder}
            onChange={setSortOrder}
            options={[
              { value: 'asc', label: '昇順' },
              { value: 'desc', label: '降順' },
            ]}
            size="medium"
          />
        </div>
        <div>
          <label className="mb-2 block text-fluid-sm font-medium text-gray-700">グループ化</label>
          <Segment
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: 'none', label: 'なし' },
              { value: 'date', label: '日付' },
              { value: 'category', label: 'カテゴリ' },
            ]}
            size="medium"
          />
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel = {
  render: () => <SettingsPanelExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '設定パネルでの使用例。複数のセグメントコントロールを組み合わせます。',
      },
    },
  },
};
