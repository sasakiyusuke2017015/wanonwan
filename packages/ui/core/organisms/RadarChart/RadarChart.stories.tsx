import { RadarChart } from './RadarChart';

/**
 * レーダーチャートコンポーネント
 *
 * 多次元データを視覚化するためのレーダーチャート。
 * 従業員の満足度分析やスキル評価などに使用します。
 */
export default {
  title: 'データ可視化/チャート/RadarChart',
  component: RadarChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
RadarChartコンポーネント。以下の機能をサポート:

- **SVGベース**: スケーラブルで高品質な描画
- **アニメーション**: データ変更時のスムーズな遷移
- **カスタマイズ**: 色、サイズ、透明度を調整可能
- **レスポンシブ**: 親要素のサイズに追従

満足度分析、スキル評価、部署比較などに使用します。
        `,
      },
    },
  },
  argTypes: {
    data: {
      control: 'object',
      description: 'チャートデータ（最低3項目必要）',
    },
    maxValue: {
      control: 'number',
      description: '最大値',
      table: { defaultValue: { summary: 5 } },
    },
    size: {
      control: 'number',
      description: 'チャートサイズ（px）',
      table: { defaultValue: { summary: 250 } },
    },
    showLabels: {
      control: 'boolean',
      description: 'ラベル表示',
      table: { defaultValue: { summary: true } },
    },
    fillOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: '塗りつぶし透明度',
      table: { defaultValue: { summary: 0.3 } },
    },
    strokeColor: {
      control: 'color',
      description: '線の色',
      table: { defaultValue: { summary: '#3b82f6' } },
    },
    fillColor: {
      control: 'color',
      description: '塗りつぶしの色',
      table: { defaultValue: { summary: '#3b82f6' } },
    },
    animated: {
      control: 'boolean',
      description: 'アニメーション有効化',
      table: { defaultValue: { summary: true } },
    },
  },
};

// 基本的な使用例（5項目）
export const Basic = {
  args: {
    data: [
      { label: '満足度', value: 4.2 },
      { label: '業務負荷', value: 3.1 },
      { label: '職場環境', value: 3.8 },
      { label: '人間関係', value: 4.5 },
      { label: 'ストレス', value: 2.9 },
    ],
    maxValue: 5,
    size: 300,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: '従業員満足度を5つの指標で表示する基本例。',
      },
    },
  },
};

// 6項目のレーダーチャート
export const SixItems = {
  args: {
    data: [
      { label: 'コミュニケーション', value: 4.0 },
      { label: 'リーダーシップ', value: 3.5 },
      { label: '技術力', value: 4.5 },
      { label: '問題解決', value: 3.8 },
      { label: 'チームワーク', value: 4.2 },
      { label: '創造性', value: 3.6 },
    ],
    maxValue: 5,
    size: 300,
    strokeColor: '#10b981',
    fillColor: '#10b981',
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'スキル評価を6項目で表示する例。',
      },
    },
  },
};

// カスタムカラー
export const CustomColors = {
  args: {
    data: [
      { label: '評価A', value: 3.0 },
      { label: '評価B', value: 4.0 },
      { label: '評価C', value: 2.5 },
      { label: '評価D', value: 3.5 },
      { label: '評価E', value: 4.5 },
    ],
    maxValue: 5,
    size: 300,
    strokeColor: '#8b5cf6',
    fillColor: '#8b5cf6',
    fillOpacity: 0.5,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'strokeColorとfillColorでカスタムカラーを適用した例。',
      },
    },
  },
};

// ラベルなし
export const WithoutLabels = {
  args: {
    data: [
      { label: '項目1', value: 4.0 },
      { label: '項目2', value: 3.0 },
      { label: '項目3', value: 3.5 },
      { label: '項目4', value: 4.5 },
      { label: '項目5', value: 2.8 },
    ],
    maxValue: 5,
    size: 250,
    showLabels: false,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'showLabels=falseでラベルを非表示にした例。',
      },
    },
  },
};

// 大きなサイズ
export const LargeSize = {
  args: {
    data: [
      { label: '満足度', value: 4.2 },
      { label: '業務負荷', value: 3.1 },
      { label: '職場環境', value: 3.8 },
      { label: '人間関係', value: 4.5 },
      { label: 'ストレス', value: 2.9 },
    ],
    maxValue: 5,
    size: 500,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'size=500の大きなチャート。詳細な分析に適しています。',
      },
    },
  },
};

// 複数チャート比較
export const MultipleCharts = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="text-center">
        <h3 className="mb-2 text-fluid-sm font-semibold text-gray-700">部署A</h3>
        <RadarChart
          data={[
            { label: '満足度', value: 4.2 },
            { label: '業務負荷', value: 3.1 },
            { label: '職場環境', value: 3.8 },
            { label: '人間関係', value: 4.5 },
            { label: 'ストレス', value: 2.9 },
          ]}
          size={250}
          strokeColor="#3b82f6"
          fillColor="#3b82f6"
          animated={false}
        />
      </div>
      <div className="text-center">
        <h3 className="mb-2 text-fluid-sm font-semibold text-gray-700">部署B</h3>
        <RadarChart
          data={[
            { label: '満足度', value: 3.8 },
            { label: '業務負荷', value: 2.5 },
            { label: '職場環境', value: 4.0 },
            { label: '人間関係', value: 3.9 },
            { label: 'ストレス', value: 1.8 },
          ]}
          size={250}
          strokeColor="#10b981"
          fillColor="#10b981"
          animated={false}
        />
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '複数のチャートを並べて部署間比較ができます。',
      },
    },
  },
};

// 高透明度
export const HighOpacity = {
  args: {
    data: [
      { label: 'スキルA', value: 4.0 },
      { label: 'スキルB', value: 3.0 },
      { label: 'スキルC', value: 4.5 },
      { label: 'スキルD', value: 3.5 },
      { label: 'スキルE', value: 4.2 },
    ],
    maxValue: 5,
    size: 300,
    fillOpacity: 0.8,
    strokeColor: '#f59e0b',
    fillColor: '#f59e0b',
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'fillOpacity=0.8で塗りつぶしを濃くした例。',
      },
    },
  },
};

// アニメーションなし
export const NoAnimation = {
  args: {
    data: [
      { label: '項目1', value: 4.0 },
      { label: '項目2', value: 3.0 },
      { label: '項目3', value: 3.5 },
      { label: '項目4', value: 4.5 },
      { label: '項目5', value: 2.8 },
    ],
    maxValue: 5,
    size: 300,
    animated: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'animated=falseでアニメーションを無効化した例。',
      },
    },
  },
};

// 低スコア例
export const LowScores = {
  args: {
    data: [
      { label: '満足度', value: 1.5 },
      { label: '業務負荷', value: 1.0 },
      { label: '職場環境', value: 1.8 },
      { label: '人間関係', value: 2.0 },
      { label: 'ストレス', value: 0.5 },
    ],
    maxValue: 5,
    size: 300,
    strokeColor: '#ef4444',
    fillColor: '#ef4444',
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: '低スコアの場合の表示例。チャートが小さく表示されます。',
      },
    },
  },
};
