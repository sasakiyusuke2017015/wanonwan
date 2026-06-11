import { useState } from 'react';

import { ResetButton } from './ResetButton';

/**
 * リセットボタンコンポーネント
 *
 * 統一されたデザインのリセットボタン。
 * フォームやフィルターのリセットに使用します。
 */
export default {
  title: '入力/ボタン/ResetButton',
  component: ResetButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
ResetButtonコンポーネント。以下の特徴があります:

- **統一デザイン**: dangerバリアント + smallサイズで統一
- **回転アイコン**: リセット用のアイコンを自動表示
- **簡潔なAPI**: onClick と label のみで使用可能

フォームのリセットやフィルターのクリアに使用します。
        `,
      },
    },
  },
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'クリック時のハンドラ',
    },
    label: {
      control: 'text',
      description: 'ボタンラベル',
      table: { defaultValue: { summary: 'リセット' } },
    },
    disabled: {
      control: 'boolean',
      description: '無効化状態',
      table: { defaultValue: { summary: false } },
    },
  },
};

// 基本的な使用例
export const Basic = {
  args: {
    onClick: () => alert('リセットされました'),
  },
  parameters: {
    docs: {
      description: {
        story: '基本的なリセットボタン。デフォルトラベルは「リセット」。',
      },
    },
  },
};

// カスタムラベル
export const CustomLabel = {
  args: {
    label: 'クリア',
    onClick: () => alert('クリアされました'),
  },
  parameters: {
    docs: {
      description: {
        story: 'labelプロパティでテキストをカスタマイズできます。',
      },
    },
  },
};

// 無効化状態
export const Disabled = {
  args: {
    disabled: true,
    onClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: '無効化されたリセットボタン。クリックできません。',
      },
    },
  },
};

// フォームリセット例
const FormResetExample = () => {
  const [name, setName] = useState('山田太郎');
  const [email, setEmail] = useState('yamada@example.com');

  const handleReset = () => {
    setName('');
    setEmail('');
  };

  return (
    <div className="w-80 rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">
        ユーザー情報入力
      </h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-fluid-sm font-medium text-gray-700">
            名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-fluid-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          <ResetButton onClick={handleReset} />
          <button className="rounded bg-blue-500 px-4 py-2 text-fluid-sm text-white hover:bg-blue-600">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export const FormReset = {
  render: () => <FormResetExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'フォーム入力をリセットする実用例。',
      },
    },
  },
};

// フィルタークリア例
const FilterClearExample = () => {
  const [searchText, setSearchText] = useState('検索ワード');
  const [category, setCategory] = useState('カテゴリA');
  const [status, setStatus] = useState('アクティブ');

  const handleClear = () => {
    setSearchText('');
    setCategory('');
    setStatus('');
  };

  return (
    <div className="w-96 rounded-lg bg-gray-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-fluid-lg font-semibold text-gray-800">検索フィルター</h3>
        <ResetButton label="フィルターをクリア" onClick={handleClear} />
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-fluid-xs font-semibold text-gray-600">
            検索
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-fluid-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-fluid-xs font-semibold text-gray-600">
            カテゴリ
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-fluid-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-fluid-xs font-semibold text-gray-600">
            ステータス
          </label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-fluid-sm"
          />
        </div>
      </div>
    </div>
  );
};

export const FilterClear = {
  render: () => <FilterClearExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'フィルター条件をクリアする実用例。',
      },
    },
  },
};

// 複数ラベルバリエーション
export const LabelVariations = {
  render: () => (
    <div className="flex gap-4">
      <ResetButton label="リセット" onClick={() => {}} />
      <ResetButton label="クリア" onClick={() => {}} />
      <ResetButton label="初期化" onClick={() => {}} />
      <ResetButton label="元に戻す" onClick={() => {}} />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '様々なラベルのバリエーション。用途に応じて選択できます。',
      },
    },
  },
};
