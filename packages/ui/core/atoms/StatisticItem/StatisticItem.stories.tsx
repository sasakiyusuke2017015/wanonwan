import React from 'react';

import { StatisticItem } from './StatisticItem';

/**
 * StatisticItem コンポーネントの Storybook 設定
 */
export default {
  title: 'データ表示/統計/StatisticItem',
  component: StatisticItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
統計情報の個別項目を表示するコンポーネント。
• 丸印 + ラベル + 値 + 単位 の形式で表示
• カラフルな丸印でカテゴリを視覚的に区別`,
      },
    },
  },
  argTypes: {
    dotColor: {
      control: { type: 'text' },
      description: '丸印の背景色（Tailwindクラス）',
    },
    label: {
      control: { type: 'text' },
      description: 'ラベルテキスト',
    },
    labelColor: {
      control: { type: 'text' },
      description: 'ラベルのテキスト色（Tailwindクラス）',
    },
    value: {
      control: { type: 'text' },
      description: '表示する値',
    },
    unit: {
      control: { type: 'text' },
      description: '単位',
    },
  },
};

// 青色の統計項目
export const Blue = {
  args: {
    dotColor: 'bg-blue-500',
    label: 'アクティブ',
    labelColor: 'text-blue-600',
    value: 120,
    unit: '名',
  },
  parameters: {
    docs: {
      description: {
        story: '青色の統計項目の例',
      },
    },
  },
};

// 緑色の統計項目
export const Green = {
  args: {
    dotColor: 'bg-green-500',
    label: '完了',
    labelColor: 'text-green-600',
    value: 85,
    unit: '件',
  },
  parameters: {
    docs: {
      description: {
        story: '緑色の統計項目の例',
      },
    },
  },
};

// 赤色の統計項目
export const Red = {
  args: {
    dotColor: 'bg-red-500',
    label: 'エラー',
    labelColor: 'text-red-600',
    value: 5,
    unit: '件',
  },
  parameters: {
    docs: {
      description: {
        story: '赤色の統計項目の例',
      },
    },
  },
};

// 黄色の統計項目
export const Yellow = {
  args: {
    dotColor: 'bg-yellow-500',
    label: '保留中',
    labelColor: 'text-yellow-600',
    value: 15,
    unit: '件',
  },
  parameters: {
    docs: {
      description: {
        story: '黄色の統計項目の例',
      },
    },
  },
};

// 単位なし
export const WithoutUnit = {
  args: {
    dotColor: 'bg-purple-500',
    label: 'スコア',
    labelColor: 'text-purple-600',
    value: 92,
  },
  parameters: {
    docs: {
      description: {
        story: '単位を省略した例',
      },
    },
  },
};

// 複数の統計項目を並べた例
export const MultipleItems = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <StatisticItem
        dotColor="bg-blue-500"
        label="受付済"
        labelColor="text-blue-600"
        value={45}
        unit="件"
      />
      <StatisticItem
        dotColor="bg-green-500"
        label="処理中"
        labelColor="text-green-600"
        value={30}
        unit="件"
      />
      <StatisticItem
        dotColor="bg-yellow-500"
        label="保留"
        labelColor="text-yellow-600"
        value={12}
        unit="件"
      />
      <StatisticItem
        dotColor="bg-red-500"
        label="キャンセル"
        labelColor="text-red-600"
        value={3}
        unit="件"
      />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '複数の統計項目を縦に並べた表示例',
      },
    },
  },
};
