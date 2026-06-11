import { useState } from 'react';

import { FilterField } from './FilterField';

/**
 * フィルタフィールドコンポーネント
 *
 * 統一されたデザインでフィルタ入力を提供。
 * テキスト、ステータス、スコア、日付など複数のフィルタタイプをサポートします。
 */
export default {
  title: 'データ操作/FilterField',
  component: FilterField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
FilterFieldコンポーネント。以下のタイプをサポート:

- **text**: テキスト検索
- **status**: 複数選択チェックボックス
- **score**: 範囲入力（min/max）
- **date**: 日付入力
- **dateRange**: 日付範囲選択（ドロップダウン）

データのフィルタリングや検索機能で使用します。
        `,
      },
    },
  },
  argTypes: {
    type: {
      description: 'フィルタのタイプ',
      control: 'select',
      options: ['text', 'status', 'score', 'date', 'dateRange'],
    },
    label: {
      description: 'フィルタのラベル',
      control: 'text',
    },
    value: {
      description: '現在の値（タイプによって型が異なる）',
      control: 'object',
    },
    placeholder: {
      description: 'プレースホルダー（text/dateタイプ）',
      control: 'text',
    },
    disabled: {
      description: '無効化',
      control: 'boolean',
    },
    className: {
      description: 'カスタムクラス',
      control: 'text',
    },
    options: {
      description: '選択肢（status/dateRangeタイプ）',
      control: 'object',
    },
    min: {
      description: '最小値（scoreタイプ）',
      control: 'number',
    },
    max: {
      description: '最大値（scoreタイプ）',
      control: 'number',
    },
    onChange: { action: 'changed' },
  },
};

// テキストフィルタ
const TextFilterExample = () => {
  const [value, setValue] = useState('');

  return (
    <div className="w-80">
      <FilterField
        type="text"
        label="名前で検索"
        value={value}
        onChange={setValue}
        placeholder="名前を入力"
      />
    </div>
  );
};

export const TextFilter = {
  render: () => <TextFilterExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'テキスト検索フィルタ。キーワード検索に使用します。',
      },
    },
  },
};

// ステータスフィルタ
const StatusFilterExample = () => {
  const [value, setValue] = useState<string[]>([]);

  const options = [
    { value: 'active', label: 'アクティブ' },
    { value: 'inactive', label: '非アクティブ' },
    { value: 'pending', label: '保留中' },
  ];

  return (
    <div className="w-80">
      <FilterField
        type="status"
        label="ステータス"
        value={value}
        onChange={setValue}
        options={options}
      />
      <div className="mt-2 text-fluid-xs text-gray-600">
        選択中: {value.length}件
      </div>
    </div>
  );
};

export const StatusFilter = {
  render: () => <StatusFilterExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ステータスフィルタ。複数選択可能なチェックボックス形式。',
      },
    },
  },
};

// スコアフィルタ
const ScoreFilterExample = () => {
  const [value, setValue] = useState<[number, number]>([1, 5]);

  return (
    <div className="w-80">
      <FilterField
        type="score"
        label="評価スコア"
        value={value}
        onChange={setValue}
        min={1}
        max={5}
      />
      <div className="mt-2 text-fluid-xs text-gray-600">
        範囲: {value[0]} 〜 {value[1]}
      </div>
    </div>
  );
};

export const ScoreFilter = {
  render: () => <ScoreFilterExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'スコア範囲フィルタ。最小値と最大値を指定できます。',
      },
    },
  },
};

// 日付フィルタ
const DateFilterExample = () => {
  const [value, setValue] = useState('');

  return (
    <div className="w-80">
      <FilterField
        type="date"
        label="登録日"
        value={value}
        onChange={setValue}
        placeholder="YYYY-MM-DD"
      />
    </div>
  );
};

export const DateFilter = {
  render: () => <DateFilterExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '日付フィルタ。テキスト入力形式。',
      },
    },
  },
};

// 日付範囲フィルタ
const DateRangeFilterExample = () => {
  const [value, setValue] = useState('');

  const options = [
    { value: 'today', label: '今日' },
    { value: 'week', label: '今週' },
    { value: 'month', label: '今月' },
    { value: 'year', label: '今年' },
  ];

  return (
    <div className="w-80">
      <FilterField
        type="dateRange"
        label="期間"
        value={value}
        onChange={setValue}
        options={options}
      />
      <div className="mt-2 text-fluid-xs text-gray-600">
        選択: {value || '未選択'}
      </div>
    </div>
  );
};

export const DateRangeFilter = {
  render: () => <DateRangeFilterExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '日付範囲フィルタ。ドロップダウンから選択します。',
      },
    },
  },
};

// 複数フィルタの組み合わせ
const MultipleFiltersExample = () => {
  const [textFilter, setTextFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [scoreFilter, setScoreFilter] = useState<[number, number]>([1, 5]);

  const statusOptions = [
    { value: 'active', label: 'アクティブ' },
    { value: 'inactive', label: '非アクティブ' },
  ];

  return (
    <div className="w-96 rounded-lg bg-gray-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">
        従業員フィルター
      </h3>
      <div className="space-y-4">
        <FilterField
          type="text"
          label="名前"
          value={textFilter}
          onChange={setTextFilter}
          placeholder="検索..."
        />
        <FilterField
          type="status"
          label="ステータス"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
        <FilterField
          type="score"
          label="評価"
          value={scoreFilter}
          onChange={setScoreFilter}
          min={1}
          max={5}
        />
      </div>
    </div>
  );
};

export const MultipleFilters = {
  render: () => <MultipleFiltersExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '複数のフィルタを組み合わせた例。検索パネルとして使用できます。',
      },
    },
  },
};
