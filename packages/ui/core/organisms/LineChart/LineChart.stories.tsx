import { LineChart } from './LineChart';

export default {
  title: 'データ可視化/チャート/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    width: {
      control: { type: 'text' },
      description: '幅(数値またはパーセンテージ)',
    },
    height: {
      control: { type: 'number', min: 200, max: 600, step: 50 },
      description: '高さ(ピクセル)',
    },
  },
};

// 基本的な折れ線グラフ
export const Default = {
  args: {
    data: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '売上',
          data: [30, 45, 35, 50, 55, 60],
          color: '#3b82f6',
        },
      ],
    },
    width: '100%',
    height: 300,
  },
};

// 複数のデータセット
export const MultipleDatasets = {
  args: {
    data: {
      labels: ['10月', '11月', '12月', '1月', '2月', '3月'],
      datasets: [
        {
          label: '仕事満足度',
          data: [3.9, 3.7, 3.9, 4.0, 3.9, 3.8],
          color: '#3498db',
        },
        {
          label: 'ストレス状況',
          data: [2.5, 2.6, 2.4, 2.3, 2.4, 2.7],
          color: '#e74c3c',
        },
        {
          label: '業務負荷',
          data: [3.5, 3.1, 3.0, 3.1, 3.3, 3.2],
          color: '#2ecc71',
        },
      ],
    },
    width: '100%',
    height: 400,
  },
};

// ダッシュボード用データ(拡張版)
export const DashboardData = {
  args: {
    data: {
      labels: [
        '10月',
        '11月',
        '12月',
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
      ],
      datasets: [
        {
          label: '仕事満足度',
          data: [3.9, 3.7, 3.9, 4.0, 3.9, 3.8, 4.1, 4.2, 4.0],
          color: '#3498db',
        },
        {
          label: 'ストレス状況',
          data: [2.5, 2.6, 2.4, 2.3, 2.4, 2.7, 2.2, 2.1, 2.3],
          color: '#e74c3c',
        },
        {
          label: '業務負荷',
          data: [3.5, 3.1, 3.0, 3.1, 3.3, 3.2, 3.4, 3.6, 3.3],
          color: '#2ecc71',
        },
        {
          label: '職場環境',
          data: [4.2, 4.1, 4.3, 4.4, 4.3, 4.2, 4.5, 4.4, 4.3],
          color: '#9b59b6',
        },
        {
          label: '人間関係',
          data: [3.8, 3.9, 3.7, 3.8, 4.0, 4.1, 3.9, 4.0, 4.2],
          color: '#f39c12',
        },
      ],
    },
    width: '100%',
    height: 350,
  },
};

// 小さいサイズ
export const Small = {
  args: {
    data: {
      labels: ['月', '火', '水', '木', '金'],
      datasets: [
        {
          label: 'アクセス数',
          data: [120, 150, 180, 140, 200],
          color: '#10b981',
        },
      ],
    },
    width: 400,
    height: 200,
  },
};

// 負の値を含むデータ
export const WithNegativeValues = {
  args: {
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: '利益',
          data: [20, -10, 15, 30],
          color: '#6366f1',
        },
        {
          label: '損失',
          data: [-5, -15, 5, 10],
          color: '#ef4444',
        },
      ],
    },
    width: '100%',
    height: 350,
  },
};

// デバッグ用シンプルグラフ
export const SimpleDebug = {
  args: {
    data: {
      labels: ['A', 'B', 'C', 'D'],
      datasets: [
        {
          label: 'テストデータ',
          data: [10, 30, 20, 40],
          color: '#000000',
        },
      ],
    },
    width: 600,
    height: 300,
  },
};
