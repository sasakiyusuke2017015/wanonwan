import { useState } from 'react';

import { TabBar, type TabItem } from './TabBar';

/**
 * 汎用タブバーコンポーネント
 *
 * ラベル表示と閉じるボタンを持つシンプルなタブバー。
 * 複数のコンテンツを切り替える際に使用します。
 */
export default {
  title: 'ナビゲーション/タブ/TabBar',
  component: TabBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
TabBarコンポーネント。以下の機能をサポート:

- **タブ切り替え**: アクティブタブの表示切り替え
- **閉じるボタン**: 各タブを閉じる機能（オプション）
- **カラーテーマ**: green, blue, tealの3種類
- **ラベル省略**: 長いラベルは自動的に省略
- **キーボード対応**: Enter/Spaceキーでタブ選択

複数のドキュメントやビューを管理する場面に使用します。
        `,
      },
    },
  },
  argTypes: {
    tabs: {
      control: 'object',
      description: 'タブの配列',
    },
    activeTabId: {
      control: 'text',
      description: 'アクティブなタブのID',
    },
    onSelectTab: {
      action: 'tab selected',
      description: 'タブ選択時のコールバック',
    },
    onCloseTab: {
      action: 'tab closed',
      description: 'タブを閉じる時のコールバック',
    },
    activeColor: {
      control: { type: 'select' },
      options: ['green', 'blue', 'teal'],
      description: 'アクティブタブのカラーテーマ',
      table: { defaultValue: { summary: 'green' } },
    },
    maxLabelWidth: {
      control: 'number',
      description: 'ラベルの最大幅（px）',
      table: { defaultValue: { summary: 150 } },
    },
  },
};

// 基本的な使用例
const BasicExample = () => {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'tab-1', label: 'ダッシュボード' },
    { id: 'tab-2', label: 'レポート' },
    { id: 'tab-3', label: '設定' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const handleCloseTab = (id: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-lg bg-gray-50 p-6">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
      />
      <div className="mt-4 rounded-lg bg-white p-6 shadow">
        <h3 className="text-fluid-lg font-semibold text-gray-800">
          {tabs.find((t) => t.id === activeTabId)?.label}
        </h3>
        <p className="mt-2 text-gray-600">
          アクティブなタブのコンテンツがここに表示されます。
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
        story: '基本的なタブバー。タブを選択したり閉じたりできます。',
      },
    },
  },
};

// 閉じるボタンなし
const NoCloseButtonExample = () => {
  const [tabs] = useState<TabItem[]>([
    { id: 'overview', label: '概要' },
    { id: 'details', label: '詳細' },
    { id: 'history', label: '履歴' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('overview');

  return (
    <div className="w-full max-w-2xl rounded-lg bg-gray-50 p-6">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
      />
      <div className="mt-4 rounded-lg bg-white p-6 shadow">
        <h3 className="text-fluid-lg font-semibold text-gray-800">
          {tabs.find((t) => t.id === activeTabId)?.label}
        </h3>
        <p className="mt-2 text-gray-600">
          固定タブの場合は閉じるボタンを表示しません。
        </p>
      </div>
    </div>
  );
};

export const NoCloseButton = {
  render: () => <NoCloseButtonExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'onCloseTabを指定しない場合、閉じるボタンは表示されません。',
      },
    },
  },
};

// カラーテーマバリエーション
const ColorThemesExample = () => {
  const tabs: TabItem[] = [
    { id: 'green-1', label: 'Green Tab 1' },
    { id: 'green-2', label: 'Green Tab 2' },
  ];

  const blueTabs: TabItem[] = [
    { id: 'blue-1', label: 'Blue Tab 1' },
    { id: 'blue-2', label: 'Blue Tab 2' },
  ];

  const tealTabs: TabItem[] = [
    { id: 'teal-1', label: 'Teal Tab 1' },
    { id: 'teal-2', label: 'Teal Tab 2' },
  ];

  return (
    <div className="w-full max-w-2xl space-y-6 rounded-lg bg-gray-50 p-6">
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold text-gray-700">
          Green Theme (デフォルト)
        </h4>
        <TabBar
          tabs={tabs}
          activeTabId="green-1"
          onSelectTab={() => {}}
          activeColor="green"
        />
      </div>
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold text-gray-700">Blue Theme</h4>
        <TabBar
          tabs={blueTabs}
          activeTabId="blue-1"
          onSelectTab={() => {}}
          activeColor="blue"
        />
      </div>
      <div>
        <h4 className="mb-2 text-fluid-sm font-semibold text-gray-700">Teal Theme</h4>
        <TabBar
          tabs={tealTabs}
          activeTabId="teal-1"
          onSelectTab={() => {}}
          activeColor="teal"
        />
      </div>
    </div>
  );
};

export const ColorThemes = {
  render: () => <ColorThemesExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '3種類のカラーテーマ（green, blue, teal）を比較できます。',
      },
    },
  },
};

// 長いラベルの省略
const LongLabelsExample = () => {
  const [tabs] = useState<TabItem[]>([
    { id: 'tab-1', label: 'とても長いタブのラベルテキストの例です' },
    { id: 'tab-2', label: 'Short' },
    {
      id: 'tab-3',
      label: 'これも非常に長いラベルでスペースが足りません',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  return (
    <div className="w-full max-w-2xl rounded-lg bg-gray-50 p-6">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        maxLabelWidth={150}
      />
      <div className="mt-4 rounded-lg bg-white p-6 shadow">
        <p className="text-fluid-sm text-gray-600">
          maxLabelWidth={150}で長いラベルが省略されます。
        </p>
      </div>
    </div>
  );
};

export const LongLabels = {
  render: () => <LongLabelsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'maxLabelWidthで指定した幅を超えるラベルは省略されます（...表示）。',
      },
    },
  },
};

// 多数のタブ
const ManyTabsExample = () => {
  const [tabs, setTabs] = useState<TabItem[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: `doc-${i + 1}`,
      label: `Document ${i + 1}`,
    }))
  );
  const [activeTabId, setActiveTabId] = useState<string>('doc-1');

  const handleCloseTab = (id: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (activeTabId === id && newTabs.length > 0) {
      const closedIndex = tabs.findIndex((t) => t.id === id);
      const newIndex = Math.min(closedIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newIndex].id);
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-lg bg-gray-50 p-6">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
      />
      <div className="mt-4 rounded-lg bg-white p-6 shadow">
        <h3 className="text-fluid-lg font-semibold text-gray-800">
          {tabs.find((t) => t.id === activeTabId)?.label}
        </h3>
        <p className="mt-2 text-gray-600">
          多数のタブがある場合は横スクロール可能です。
        </p>
      </div>
    </div>
  );
};

export const ManyTabs = {
  render: () => <ManyTabsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '多数のタブを開いている場合の表示例。横スクロールで対応できます。',
      },
    },
  },
};

// 動的タブ追加
const DynamicTabsExample = () => {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'tab-1', label: 'タブ 1' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [nextId, setNextId] = useState(2);

  const handleAddTab = () => {
    const newTab: TabItem = {
      id: `tab-${nextId}`,
      label: `タブ ${nextId}`,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setNextId(nextId + 1);
  };

  const handleCloseTab = (id: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-lg bg-gray-50 p-6">
      <div className="mb-4 flex justify-between">
        <h3 className="text-fluid-lg font-semibold text-gray-800">動的タブ管理</h3>
        <button
          onClick={handleAddTab}
          className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          + タブを追加
        </button>
      </div>
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        activeColor="teal"
      />
      <div className="mt-4 rounded-lg bg-white p-6 shadow">
        <h4 className="text-md font-semibold text-gray-800">
          {tabs.find((t) => t.id === activeTabId)?.label}
        </h4>
        <p className="mt-2 text-fluid-sm text-gray-600">
          現在 {tabs.length} 個のタブが開いています。
        </p>
      </div>
    </div>
  );
};

export const DynamicTabs = {
  render: () => <DynamicTabsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'タブを動的に追加・削除できるインタラクティブな例。',
      },
    },
  },
};
