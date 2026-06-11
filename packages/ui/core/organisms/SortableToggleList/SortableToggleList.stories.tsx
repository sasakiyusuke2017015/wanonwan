import { useState } from 'react';

import { SortableToggleList, SortableItem } from './SortableToggleList';

/**
 * ドラッグ&ドロップで並び替え可能なトグルリスト
 *
 * dnd-kitを使用したソート可能なトグルスイッチのリスト。
 * 表示順序をカスタマイズできる機能を提供します。
 */
export default {
  title: 'データ操作/SortableToggleList',
  component: SortableToggleList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
SortableToggleListコンポーネント。以下の機能をサポート:

- **ドラッグ&ドロップ**: dnd-kitによる直感的な並び替え
- **トグルスイッチ**: 各項目のON/OFF切り替え
- **無効化**: 特定項目の操作を無効化可能
- **カスタマイズ**: 角丸などのスタイル調整

ダッシュボードのウィジェット表示順や、
表示列のカスタマイズなどに使用します。
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: '表示するアイテムのリスト',
    },
    order: {
      control: 'object',
      description: '現在の表示順序（ID配列）',
    },
    onOrderChange: {
      action: 'order changed',
      description: '順序変更時のコールバック',
    },
    onItemToggle: {
      action: 'item toggled',
      description: 'トグル切り替え時のコールバック',
    },
    itemRadius: {
      control: 'text',
      description: 'アイテムコンテナの角丸',
      table: { defaultValue: { summary: '8px' } },
    },
    toggleRadius: {
      control: 'text',
      description: 'トグルスイッチの角丸',
      table: { defaultValue: { summary: '9999px' } },
    },
  },
};

// 基本的な使用例
const BasicExample = () => {
  const [items] = useState<SortableItem[]>([
    { id: 'item-1', label: '売上推移', checked: true },
    { id: 'item-2', label: '部署別統計', checked: true },
    { id: 'item-3', label: 'アラート一覧', checked: false },
    { id: 'item-4', label: '満足度分析', checked: true },
  ]);

  const [order, setOrder] = useState<string[]>([
    'item-1',
    'item-2',
    'item-3',
    'item-4',
  ]);

  const [itemStates, setItemStates] = useState<Record<string, boolean>>({
    'item-1': true,
    'item-2': true,
    'item-3': false,
    'item-4': true,
  });

  const handleToggle = (id: string) => {
    setItemStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const itemsWithState = items.map((item) => ({
    ...item,
    checked: itemStates[item.id] ?? item.checked,
  }));

  return (
    <div className="w-full max-w-2xl rounded-lg bg-gray-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">
        ダッシュボード表示項目
      </h3>
      <SortableToggleList
        items={itemsWithState}
        order={order}
        onOrderChange={setOrder}
        onItemToggle={handleToggle}
      />
    </div>
  );
};

export const Basic = {
  render: () => <BasicExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'ドラッグ&ドロップで順序を変更し、トグルでON/OFFを切り替えられます。',
      },
    },
  },
};

// 無効化項目を含む例
const DisabledItemsExample = () => {
  const [items] = useState<SortableItem[]>([
    { id: 'item-1', label: '必須項目（固定）', checked: true, disabled: true },
    { id: 'item-2', label: 'カスタム項目A', checked: true },
    { id: 'item-3', label: 'カスタム項目B', checked: false },
    { id: 'item-4', label: 'カスタム項目C', checked: true },
  ]);

  const [order, setOrder] = useState<string[]>([
    'item-1',
    'item-2',
    'item-3',
    'item-4',
  ]);

  const [itemStates, setItemStates] = useState<Record<string, boolean>>({
    'item-1': true,
    'item-2': true,
    'item-3': false,
    'item-4': true,
  });

  const handleToggle = (id: string) => {
    setItemStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const itemsWithState = items.map((item) => ({
    ...item,
    checked: itemStates[item.id] ?? item.checked,
  }));

  return (
    <div className="w-full max-w-2xl rounded-lg bg-gray-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">
        表示列のカスタマイズ
      </h3>
      <p className="mb-4 text-fluid-sm text-gray-600">
        必須項目は無効化されており、変更できません。
      </p>
      <SortableToggleList
        items={itemsWithState}
        order={order}
        onOrderChange={setOrder}
        onItemToggle={handleToggle}
      />
    </div>
  );
};

export const WithDisabledItems = {
  render: () => <DisabledItemsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '無効化された項目を含む例。必須項目などを固定できます。',
      },
    },
  },
};

// カスタム角丸
const CustomStyleExample = () => {
  const [items] = useState<SortableItem[]>([
    { id: 'widget-1', label: 'ウィジェット1', checked: true },
    { id: 'widget-2', label: 'ウィジェット2', checked: false },
    { id: 'widget-3', label: 'ウィジェット3', checked: true },
  ]);

  const [order, setOrder] = useState<string[]>([
    'widget-1',
    'widget-2',
    'widget-3',
  ]);

  const [itemStates, setItemStates] = useState<Record<string, boolean>>({
    'widget-1': true,
    'widget-2': false,
    'widget-3': true,
  });

  const handleToggle = (id: string) => {
    setItemStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const itemsWithState = items.map((item) => ({
    ...item,
    checked: itemStates[item.id] ?? item.checked,
  }));

  return (
    <div className="w-full max-w-2xl rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">
        カスタムスタイル
      </h3>
      <SortableToggleList
        items={itemsWithState}
        order={order}
        onOrderChange={setOrder}
        onItemToggle={handleToggle}
        itemRadius="16px"
        toggleRadius="4px"
      />
    </div>
  );
};

export const CustomStyle = {
  render: () => <CustomStyleExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'itemRadiusとtoggleRadiusプロパティでスタイルをカスタマイズできます。',
      },
    },
  },
};

// 多数のアイテム
const ManyItemsExample = () => {
  const [items] = useState<SortableItem[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: `metric-${i + 1}`,
      label: `指標${i + 1}`,
      checked: i % 3 !== 0,
    }))
  );

  const [order, setOrder] = useState<string[]>(
    Array.from({ length: 12 }, (_, i) => `metric-${i + 1}`)
  );

  const [itemStates, setItemStates] = useState<Record<string, boolean>>(
    Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [`metric-${i + 1}`, i % 3 !== 0])
    )
  );

  const handleToggle = (id: string) => {
    setItemStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const itemsWithState = items.map((item) => ({
    ...item,
    checked: itemStates[item.id] ?? item.checked,
  }));

  return (
    <div className="w-full max-w-4xl rounded-lg bg-gray-50 p-6">
      <h3 className="mb-4 text-fluid-lg font-semibold text-gray-800">
        多数の指標を管理
      </h3>
      <SortableToggleList
        items={itemsWithState}
        order={order}
        onOrderChange={setOrder}
        onItemToggle={handleToggle}
      />
    </div>
  );
};

export const ManyItems = {
  render: () => <ManyItemsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '多数のアイテムがある場合の表示例。自動的に折り返されます。',
      },
    },
  },
};

// ドラッグイベント通知
const DragEventsExample = () => {
  const [items] = useState<SortableItem[]>([
    { id: 'col-1', label: '名前', checked: true },
    { id: 'col-2', label: '部署', checked: true },
    { id: 'col-3', label: 'ステータス', checked: false },
    { id: 'col-4', label: '最終更新', checked: true },
  ]);

  const [order, setOrder] = useState<string[]>([
    'col-1',
    'col-2',
    'col-3',
    'col-4',
  ]);

  const [itemStates, setItemStates] = useState<Record<string, boolean>>({
    'col-1': true,
    'col-2': true,
    'col-3': false,
    'col-4': true,
  });

  const [dragInfo, setDragInfo] = useState<string>('');

  const handleToggle = (id: string) => {
    setItemStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (id: string) => {
    const item = items.find((i) => i.id === id);
    setDragInfo(`ドラッグ中: ${item?.label}`);
  };

  const handleDragEnd = () => {
    setDragInfo('');
  };

  const itemsWithState = items.map((item) => ({
    ...item,
    checked: itemStates[item.id] ?? item.checked,
  }));

  return (
    <div className="w-full max-w-2xl space-y-4 rounded-lg bg-gray-50 p-6">
      <h3 className="text-fluid-lg font-semibold text-gray-800">
        テーブル表示列の設定
      </h3>
      {dragInfo && (
        <div className="rounded-lg bg-blue-100 p-3 text-fluid-sm font-medium text-blue-800">
          {dragInfo}
        </div>
      )}
      <SortableToggleList
        items={itemsWithState}
        order={order}
        onOrderChange={setOrder}
        onItemToggle={handleToggle}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};

export const DragEvents = {
  render: () => <DragEventsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'onDragStartとonDragEndコールバックでドラッグイベントを監視できます。',
      },
    },
  },
};
