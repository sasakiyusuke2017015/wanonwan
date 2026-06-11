import { useState } from 'react';

import type { StoryFn } from '@storybook/react';

import { isNullish } from '../../utils/isNullish';

import { InteractiveTable } from './InteractiveTable';
import type { InteractiveTableProps, Column, TableRowData, LinkData, InternalLinkData } from './types';

/**
 * インタラクティブテーブルコンポーネント
 *
 * 行選択、色分け、ホバー効果、キーボードナビゲーションなど、
 * ユーザー操作に対応したテーブルコンポーネントです。
 */
export default {
  title: 'データ表示/テーブル/InteractiveTable',
  component: InteractiveTable,
  tags: ['autodocs'],
  decorators: [
    (Story: StoryFn) => (
      <div className="min-h-screen bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    columns: {
      description: 'テーブルのカラム定義配列',
      control: 'object',
    },
    data: {
      description: '表示するデータの配列',
      control: 'object',
    },
    searchable: {
      description: '検索機能の有効/無効',
      control: 'boolean',
    },
    enableRowHighlight: {
      description: '行フォーカス時のハイライト表示',
      control: 'boolean',
    },
    enableKeyboardNavigation: {
      description: 'キーボードナビゲーション機能',
      control: 'boolean',
    },
    onCellClick: { action: 'cell clicked' },
    onRowHover: { action: 'row hovered' },
    onRowFocus: { action: 'row focused' },
  },
  parameters: {
    docs: {
      description: {
        component: `
InteractiveTableコンポーネント。以下の機能をサポート:

- **rowStyleType**: 'red', 'green', 'yellow'による行の色分け
- **ホバー効果**: hover時の色変化とアニメーション
- **フォーカス管理**: 行クリック時の青い枠線表示
- **キーボードナビゲーション**: 矢印キー、Tab、Enter対応
- **リンクカラム**: 外部・内部リンクの表示
- **検索機能**: 特定列での絞り込み検索

業務システムでのデータ一覧表示に最適です。
        `,
      },
    },
  },
};

// 基本的なカラム定義
const basicColumns = [
  { accessor: 'id', label: 'ID', proportion: '80px' },
  { accessor: 'name', label: '名前', proportion: '150px' },
  { accessor: 'department', label: '部署', proportion: '120px' },
  { accessor: 'status', label: 'ステータス', proportion: '100px' },
];

// 基本的なデータ
const basicData = [
  { id: '001', name: '山田太郎', department: '開発部', status: 'アクティブ' },
  {
    id: '002',
    name: '佐藤花子',
    department: 'デザイン部',
    status: 'アクティブ',
  },
  { id: '003', name: '鈴木一郎', department: '営業部', status: '休暇中' },
  { id: '004', name: '田中美咲', department: '開発部', status: 'アクティブ' },
  { id: '005', name: '伊藤健太', department: '企画部', status: 'アクティブ' },
];

// メモ履歴カラム定義
const memoColumns = [
  { accessor: 'month', label: '月', proportion: '15%' },
  { accessor: 'memo', label: 'メモ', proportion: '50%' },
  { accessor: 'nextAction', label: '次回アクション', proportion: '35%' },
];

// インタラクティブな例のためのラッパーコンポーネント
function InteractiveTableWrapper({
  columns,
  data,
  ...props
}: {
  columns: Column[];
  data: TableRowData[];
  [key: string]: unknown;
}) {
  const [focusedRow, setFocusedRow] = useState<number | null>(null);

  return (
    <InteractiveTable
      columns={columns}
      data={data}
      focusedRow={focusedRow}
      setFocusedRow={setFocusedRow}
      {...props}
    />
  );
}

// 基本的なテーブル
export const Basic = {
  render: (args: InteractiveTableProps) => <InteractiveTableWrapper {...args} />,
  args: {
    columns: basicColumns,
    data: basicData,
    searchable: true,
    searchColumn: 'name',
    enableRowHighlight: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '基本的なInteractiveTable。検索機能、行ハイライト、ホバー効果を含む標準的な使用例',
      },
    },
  },
};

// rowStyleType機能
export const RowStyleTypes = {
  render: (args: InteractiveTableProps) => <InteractiveTableWrapper {...args} />,
  args: {
    columns: memoColumns,
    data: [
      {
        month: '2025/10',
        memo: '今月のメモです。重要な情報が含まれています。',
        nextAction: '来月までに対応が必要です。',
        rowStyleType: 'red',
      },
      {
        month: '2025/09',
        memo: '先月のメモです。完了済みの項目です。',
        nextAction: '完了しました。',
        rowStyleType: 'green',
      },
      {
        month: '2025/08',
        memo: '注意が必要な項目があります。',
        nextAction: '確認中です。',
        rowStyleType: 'yellow',
      },
      {
        month: '2025/07',
        memo: '通常のメモです。特に問題ありません。',
        nextAction: '特になし。',
      },
    ],
    searchable: false,
    enableRowHighlight: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'rowStyleType機能のデモ。red/green/yellow/defaultの色分けとhover効果を確認できます。',
      },
    },
  },
};

// ホバー・フォーカス効果
const HoverAndFocusDemo = (args: InteractiveTableProps) => {
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-4 rounded-lg bg-blue-50 p-4">
        <p className="mb-2 text-fluid-sm font-medium text-blue-800">
          ホバー・フォーカス効果デモ
        </p>
        <div className="space-y-1 text-fluid-xs text-blue-600">
          <p>
            フォーカス行:{' '}
            {!isNullish(focusedRow) ? `${focusedRow + 1}行目` : 'なし'}
          </p>
          <p>
            ホバー行: {!isNullish(hoveredRow) ? `${hoveredRow + 1}行目` : 'なし'}
          </p>
        </div>
      </div>
      <InteractiveTable
        {...args}
        focusedRow={focusedRow}
        setFocusedRow={setFocusedRow}
        onRowHover={setHoveredRow}
        onRowFocus={setFocusedRow}
      />
    </div>
  );
};

export const HoverAndFocus = {
  render: (args: InteractiveTableProps) => <HoverAndFocusDemo {...args} />,
  args: {
    columns: basicColumns,
    data: basicData,
    searchable: false,
    enableRowHighlight: true,
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'ホバー・フォーカス効果の確認。行をクリックすると青い枠線が表示され、ホバー時にアニメーション効果が発生します。',
      },
    },
  },
};

// リンクカラム
export const LinkColumns = {
  render: (args: InteractiveTableProps) => <InteractiveTableWrapper {...args} />,
  args: {
    columns: [
      { label: 'ID', accessor: 'id', proportion: '80px' },
      {
        label: '名前',
        accessor: 'name',
        cellType: 'internal',
        proportion: '150px',
      },
      {
        label: 'ウェブサイト',
        accessor: 'website',
        cellType: 'link',
        proportion: '200px',
      },
      { label: 'ステータス', accessor: 'status', proportion: '100px' },
    ],
    data: [
      {
        id: '001',
        name: {
          text: '山田太郎',
          to: '/employee/001',
          variant: 'text',
          color: 'primary',
        },
        website: {
          text: 'Google',
          url: 'https://www.google.com',
          target: '_blank',
        },
        status: 'アクティブ',
      },
      {
        id: '002',
        name: {
          text: '佐藤花子',
          to: '/employee/002',
          variant: 'text',
          color: 'primary',
        },
        website: 'https://github.com',
        status: 'アクティブ',
      },
    ],
    searchable: false,
    onLinkClick: (linkData: LinkData, _rowIndex: number, _colIndex: number) => {
      window.alert(`外部リンク: ${linkData.text || linkData.url}`);
    },
    onInternalLinkClick: (linkData: InternalLinkData, _rowIndex: number, _colIndex: number) => {
      window.alert(`内部リンク: ${linkData.text} → ${linkData.to}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'リンクカラムの例。type="link"で外部リンク、type="internal"で内部リンクを作成できます。',
      },
    },
  },
};

// キーボードナビゲーション
const KeyboardNavigationDemo = (args: InteractiveTableProps) => {
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });

  return (
    <div>
      <div className="mb-4 rounded-lg bg-green-50 p-4">
        <p className="mb-2 text-fluid-sm font-medium text-green-800">
          キーボードナビゲーション
        </p>
        <div className="space-y-1 text-fluid-xs text-green-600">
          <ul className="list-inside list-disc space-y-1">
            <li>テーブルをクリックしてフォーカス</li>
            <li>矢印キーでセル移動</li>
            <li>Tab/Shift+Tabで次/前のセル</li>
            <li>Home/Endで行の最初/最後</li>
            <li>Ctrl+Home/Endでテーブルの最初/最後</li>
            <li>Enterでセルクリック</li>
          </ul>
        </div>
      </div>
      <InteractiveTable
        {...args}
        focusedRow={focusedRow}
        setFocusedRow={setFocusedRow}
        focusedCell={focusedCell}
        setFocusedCell={setFocusedCell}
        enableKeyboardNavigation={true}
      />
    </div>
  );
};

export const KeyboardNavigation = {
  render: (args: InteractiveTableProps) => <KeyboardNavigationDemo {...args} />,
  args: {
    columns: basicColumns,
    data: basicData,
    searchable: false,
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'キーボードナビゲーション機能。矢印キーやTabキーでテーブル内を移動できます。',
      },
    },
  },
};

// 大量データ（rowStyleType含む）
export const LargeDataset = {
  render: (args: InteractiveTableProps) => <InteractiveTableWrapper {...args} />,
  args: {
    columns: memoColumns,
    data: Array.from({ length: 100 }, (_, i) => {
      const year = 2024 - Math.floor(i / 12);
      const month = (i % 12) + 1;
      const rowStyleTypes = ['red', 'green', 'yellow', undefined];
      const randomStyleType =
        rowStyleTypes[Math.floor(Math.random() * rowStyleTypes.length)];

      return {
        month: `${year}/${String(month).padStart(2, '0')}`,
        memo:
          [
            '重要な議題について話し合いました',
            'プロジェクトの進捗が順調です',
            '課題が発生しており対応が必要',
            'チームメンバーとの連携が良好',
            '新しい取り組みを開始しました',
            '目標を達成することができました',
            '改善点を見つけて対応中です',
            '次の段階に進む準備完了',
          ][Math.floor(Math.random() * 8)] + ` (${i + 1}件目)`,
        nextAction: [
          'レポートを提出する',
          '進捗を報告する',
          'チームと検討する',
          '関係者と調整する',
          '計画を見直す',
          '結果を分析する',
          '新しい目標を設定',
          'フォローアップ継続',
        ][Math.floor(Math.random() * 8)],
        rowStyleType: randomStyleType,
      };
    }),
    searchable: true,
    searchColumn: 'memo',
  },
  parameters: {
    docs: {
      description: {
        story:
          '100件の大量データでのパフォーマンステスト。rowStyleTypeによる色分けとhover効果を確認できます。',
      },
    },
  },
};
