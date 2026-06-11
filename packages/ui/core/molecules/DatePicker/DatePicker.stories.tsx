import { DatePicker } from './DatePicker';

/**
 * 日付入力コンポーネント
 *
 * HTML5のdate入力フィールドをベースとした日付選択コンポーネントです。
 * min/max制限やバリデーション機能を含みます。
 */
export default {
  title: 'フォーム/日付/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
日付・月選択に特化した入力コンポーネント。以下の機能をサポート:

- **日付/月選択**: pickerModeで日付（date）または月（month）を選択
- **バリアント**: default（白背景）、dark（暗い背景）、outlined（透明・太枠）
- **ナビゲーション**: showNavigationで前後月への移動ボタンを表示
- **制限設定**: minDate/maxDateによる選択可能範囲の制限
- **クリア機能**: allowClearでクリアボタンを表示
- **ハイライト**: highlightedMonthsで特定月をマーク

業務アプリケーションの日付入力に最適化されています。
        `,
      },
      source: {
        transform: (code: string, storyContext: { args: Record<string, unknown> }) => {
          const { args } = storyContext;
          const props = [];

          // name
          if (args.name) {
            props.push(`name="${args.name}"`);
          }

          // value
          if (args.value) {
            props.push(`value="${args.value}"`);
          }

          // minDate
          if (args.minDate) {
            props.push(`minDate="${args.minDate}"`);
          }

          // maxDate
          if (args.maxDate) {
            props.push(`maxDate="${args.maxDate}"`);
          }

          // onChange
          if (args.onChange) {
            props.push(`onChange={handleChange}`);
          }

          // onFocus
          if (args.onFocus) {
            props.push(`onFocus={handleFocus}`);
          }

          // onBlur
          if (args.onBlur) {
            props.push(`onBlur={handleBlur}`);
          }

          const propsString = props.length > 0 ? ' ' + props.join(' ') : '';

          return `import DatePicker from './components/molecules/DatePicker';

<DatePicker${propsString} />`;
        },
      },
    },
  },
  argTypes: {
    pickerMode: {
      description: '選択モード',
      control: 'select',
      options: ['date', 'month'],
    },
    variant: {
      description: 'バリアント（外観）',
      control: 'select',
      options: ['default', 'dark', 'outlined'],
    },
    size: {
      description: 'サイズ',
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    showNavigation: {
      description: '前後月ナビゲーションボタンを表示（monthモードのみ）',
      control: 'boolean',
    },
    allowClear: {
      description: 'クリアボタンを表示',
      control: 'boolean',
    },
    name: {
      description: 'フィールドの名前',
      control: 'text',
    },
    value: {
      description: '選択された日付(YYYY-MM-DD形式またはYYYY-MM形式)',
      control: 'text',
    },
    minDate: {
      description: '選択可能な最小日付',
      control: 'text',
    },
    maxDate: {
      description: '選択可能な最大日付',
      control: 'text',
    },
    menuAlign: {
      description: 'ポップアップの配置',
      control: 'select',
      options: ['left', 'right'],
    },
    onChange: {
      description: '日付変更時のコールバック関数',
      action: 'date changed',
    },
  },
};

export const Default = {
  args: {
    name: 'date',
    value: '2025-05-26',
  },
  parameters: {
    docs: {
      description: {
        story: '基本的な日付入力フィールドの表示例',
      },
      source: {
        code: `import DatePicker from './components/molecules/DatePicker';

<DatePicker 
  name="date" 
  value="2025-05-26" 
  onChange={handleChange} 
/>`,
      },
    },
  },
};

export const Empty = {
  args: {
    name: 'date',
    value: '',
  },
  parameters: {
    docs: {
      description: {
        story: '値が設定されていない空の状態',
      },
      source: {
        code: `import DatePicker from './components/molecules/DatePicker';

<DatePicker 
  name="date" 
  value="" 
  onChange={handleChange} 
/>`,
      },
    },
  },
};

export const WithMinDate = {
  args: {
    name: 'date',
    value: '2025-05-26',
    minDate: '2025-01-01',
  },
  parameters: {
    docs: {
      description: {
        story: '最小日付制限を設定した例。2025年1月1日以前は選択できません',
      },
      source: {
        code: `import DatePicker from './components/molecules/DatePicker';

<DatePicker 
  name="date" 
  value="2025-05-26" 
  minDate="2025-01-01" 
  onChange={handleChange} 
/>`,
      },
    },
  },
};

export const PastDate = {
  args: {
    name: 'date',
    value: '2024-12-25',
    minDate: '2020-01-01',
  },
  parameters: {
    docs: {
      description: {
        story: '過去の日付が選択された状態。最小日付制限内での過去日付選択例',
      },
      source: {
        code: `import DatePicker from './components/molecules/DatePicker';

<DatePicker
  name="date"
  value="2024-12-25"
  minDate="2020-01-01"
  onChange={handleChange}
/>`,
      },
    },
  },
};

// ===========================================
// 月選択モード（Month Picker）
// ===========================================

export const MonthPicker = {
  args: {
    pickerMode: 'month',
    value: '2025-03',
  },
  parameters: {
    docs: {
      description: {
        story: '月選択モード。日付ではなく年月を選択',
      },
    },
  },
};

export const MonthPickerWithNavigation = {
  args: {
    pickerMode: 'month',
    value: '2025-03',
    showNavigation: true,
  },
  parameters: {
    docs: {
      description: {
        story: '月選択 + 前後月ナビゲーションボタン付き',
      },
    },
  },
};

// ===========================================
// バリアント
// ===========================================

export const DarkVariant = {
  args: {
    variant: 'dark',
    value: '2025-03-19',
  },
  parameters: {
    docs: {
      description: {
        story: 'ダークバリアント。暗い背景に白文字',
      },
    },
  },
};

export const OutlinedVariant = {
  args: {
    variant: 'outlined',
    value: '2025-03-19',
  },
  parameters: {
    docs: {
      description: {
        story: 'アウトラインバリアント。透明背景に太枠',
      },
    },
  },
};

// ===========================================
// サイズ
// ===========================================

export const SmallSize = {
  args: {
    size: 'small',
    value: '2025-03-19',
  },
  parameters: {
    docs: {
      description: {
        story: '小サイズ',
      },
    },
  },
};

export const LargeSize = {
  args: {
    size: 'large',
    value: '2025-03-19',
  },
  parameters: {
    docs: {
      description: {
        story: '大サイズ',
      },
    },
  },
};

// ===========================================
// 機能オプション
// ===========================================

export const WithClearButton = {
  args: {
    value: '2025-03-19',
    allowClear: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'クリアボタン付き。×ボタンで日付をクリア可能',
      },
    },
  },
};

export const RightAligned = {
  args: {
    value: '2025-03-19',
    menuAlign: 'right',
  },
  parameters: {
    docs: {
      description: {
        story: 'ポップアップを右寄せで表示',
      },
    },
  },
};

// ===========================================
// プロジェクト実使用例
// ===========================================

export const ProjectUsage = {
  args: {
    pickerMode: 'month',
    variant: 'dark',
    size: 'medium',
    showNavigation: true,
    allowClear: true,
    value: '2025-03',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: `
**1on1プロジェクトでの実使用例**

回答一覧画面で使用されている構成:
- 月選択モード（pickerMode="month"）
- ダークバリアント（variant="dark"）
- ナビゲーション付き（showNavigation）
- クリア可能（allowClear）
        `,
      },
    },
  },
};

export const ProjectUsageWithHighlight = {
  args: {
    pickerMode: 'month',
    variant: 'dark',
    size: 'medium',
    showNavigation: true,
    allowClear: true,
    value: '2025-03',
    highlightedMonths: [
      { month: '2025-01', colors: ['blue'] },
      { month: '2025-03', colors: ['green'] },
      { month: '2025-06', colors: ['red', 'blue'] },
    ],
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: `
**ハイライト月付きの実使用例**

特定の月にドットマーカーを表示。バッチ開始月などをマークする際に使用。
複数色を指定すると複数のドットが表示される。
        `,
      },
    },
  },
};
