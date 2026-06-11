import { Calendar } from './Calendar';

/**
 * カレンダーコンポーネント
 *
 * 日付/月選択カレンダー。単体でも DatePicker 内でも利用可能。
 */
export default {
  title: 'フォーム/日付/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
日付/月選択カレンダーコンポーネント。以下の機能をサポート:

- **モード切替**: \`mode="date"\`（日選択）/ \`mode="month"\`（月選択）
- **ナビゲーション**: 前月/次月、前年/次年への移動
- **範囲制限**: minDate/maxDateで選択可能範囲を制限
- **今日ハイライト**: 今日の日付をリング表示
- **曜日色分け**: 日曜(赤)、土曜(青)
- **月ハイライト**: 特定月にドットマーカーを表示（monthモード）

DatePickerのポップアップなしで、埋め込み型カレンダーとして使用可能。
        `,
      },
    },
  },
  argTypes: {
    mode: {
      description: '選択モード',
      control: 'select',
      options: ['date', 'month'],
    },
    selectedDate: {
      description: '選択中の日付',
      control: 'date',
    },
    minDate: {
      description: '選択可能な最小日付',
      control: 'date',
    },
    maxDate: {
      description: '選択可能な最大日付',
      control: 'date',
    },
    primaryBgColor: {
      description: 'ヘッダー背景色',
      control: 'color',
    },
    borderRadius: {
      description: '角丸',
      control: 'text',
    },
    onSelect: {
      description: '日付/月選択時のコールバック',
      action: 'selected',
    },
    onNavigate: {
      description: '月/年変更時のコールバック',
      action: 'navigated',
    },
  },
};

// ===========================================
// 日選択モード（Date Mode）
// ===========================================

export const DateMode = {
  args: {
    mode: 'date',
    selectedDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: '日選択モード。カレンダーで日付を選択。',
      },
    },
  },
};

export const DateModeNoSelection = {
  args: {
    mode: 'date',
    selectedDate: null,
  },
  parameters: {
    docs: {
      description: {
        story: '日付が選択されていない状態。今日がリングでハイライトされる。',
      },
    },
  },
};

export const DateModeWithRange = {
  args: {
    mode: 'date',
    selectedDate: new Date(2025, 2, 15),
    minDate: new Date(2025, 2, 1),
    maxDate: new Date(2025, 2, 31),
  },
  parameters: {
    docs: {
      description: {
        story: '選択可能範囲を制限。範囲外の日付はグレーアウトされ選択不可。',
      },
    },
  },
};

// ===========================================
// 月選択モード（Month Mode）
// ===========================================

export const MonthMode = {
  args: {
    mode: 'month',
    selectedDate: new Date(2025, 2, 1),
  },
  parameters: {
    docs: {
      description: {
        story: '月選択モード。年ごとに12ヶ月のグリッドを表示。',
      },
    },
  },
};

export const MonthModeWithHighlight = {
  args: {
    mode: 'month',
    selectedDate: new Date(2025, 2, 1),
    highlightedMonths: [
      { month: '2025-01', colors: ['blue'] },
      { month: '2025-03', colors: ['green'] },
      { month: '2025-06', colors: ['red', 'blue'] },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '特定月にドットマーカーを表示。複数色指定可能。',
      },
    },
  },
};

export const MonthModeWithRange = {
  args: {
    mode: 'month',
    selectedDate: new Date(2025, 2, 1),
    minDate: new Date(2024, 0, 1),
    maxDate: new Date(2025, 11, 31),
  },
  parameters: {
    docs: {
      description: {
        story: '年範囲を制限。2024年〜2025年のみ選択可能。',
      },
    },
  },
};

// ===========================================
// カスタマイズ
// ===========================================

export const CustomColors = {
  args: {
    mode: 'date',
    selectedDate: new Date(),
    primaryBgColor: '#10b981',
  },
  parameters: {
    docs: {
      description: {
        story: 'ヘッダー背景色をカスタマイズ（緑）。',
      },
    },
  },
};

export const CustomColorsMonth = {
  args: {
    mode: 'month',
    selectedDate: new Date(2025, 2, 1),
    primaryBgColor: '#8b5cf6',
  },
  parameters: {
    docs: {
      description: {
        story: '月選択モードでヘッダー背景色をカスタマイズ（紫）。',
      },
    },
  },
};

export const LargeBorderRadius = {
  args: {
    mode: 'date',
    selectedDate: new Date(),
    borderRadius: '1rem',
  },
  parameters: {
    docs: {
      description: {
        story: '角丸を大きくしたバリエーション。',
      },
    },
  },
};
