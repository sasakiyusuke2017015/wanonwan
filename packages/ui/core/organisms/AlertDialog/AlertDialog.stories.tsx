import React from 'react';

import { AlertDialog } from './AlertDialog';

/**
 * AlertDialog コンポーネントの Storybook 設定
 */
export default {
  title: 'フィードバック/ダイアログ/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
window.alertの代替として使用するアラートダイアログコンポーネント。
• 4種類のタイプ(info, warning, error, success)
• Escキーまたはエンターキーで閉じることが可能
• 背景クリックで閉じることが可能`,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
      description: 'ダイアログの表示状態',
      table: { defaultValue: { summary: false } },
    },
    type: {
      control: { type: 'select' },
      options: ['info', 'warning', 'error', 'success'],
      description: 'アラートのタイプ',
      table: { defaultValue: { summary: 'info' } },
    },
    title: {
      control: { type: 'text' },
      description: 'ダイアログのタイトル',
    },
    message: {
      control: { type: 'text' },
      description: 'アラートメッセージ',
    },
    confirmText: {
      control: { type: 'text' },
      description: '確認ボタンのテキスト',
      table: { defaultValue: { summary: 'OK' } },
    },
    onClose: {
      action: 'closed',
      description: '閉じるときのハンドラ',
    },
  },
};

// 情報アラート
export const Info = {
  args: {
    isOpen: true,
    type: 'info',
    title: '情報',
    message: 'これは情報メッセージです。',
    confirmText: '閉じる',
  },
  parameters: {
    docs: {
      description: {
        story: '情報を表示する標準的なアラート',
      },
    },
  },
};

// 警告アラート
export const Warning = {
  args: {
    isOpen: true,
    type: 'warning',
    title: '警告',
    message: 'この操作には注意が必要です。',
    confirmText: '了解',
  },
  parameters: {
    docs: {
      description: {
        story: '注意を促す警告アラート',
      },
    },
  },
};

// エラーアラート
export const Error = {
  args: {
    isOpen: true,
    type: 'error',
    title: 'エラー',
    message: 'エラーが発生しました。もう一度お試しください。',
    confirmText: '閉じる',
  },
  parameters: {
    docs: {
      description: {
        story: 'エラーを通知するアラート',
      },
    },
  },
};

// 成功アラート
export const Success = {
  args: {
    isOpen: true,
    type: 'success',
    title: '成功',
    message: '操作が正常に完了しました。',
    confirmText: '閉じる',
  },
  parameters: {
    docs: {
      description: {
        story: '成功を通知するアラート',
      },
    },
  },
};

// タイトルなし
export const WithoutTitle = {
  args: {
    isOpen: true,
    type: 'info',
    message: 'タイトルなしのシンプルなアラートです。',
  },
  parameters: {
    docs: {
      description: {
        story: 'タイトルを省略したシンプルなアラート',
      },
    },
  },
};

// 長いメッセージ
export const LongMessage = {
  args: {
    isOpen: true,
    type: 'info',
    title: 'お知らせ',
    message: `これは長いメッセージの例です。
複数行にわたるテキストも適切に表示されます。

改行も正しく反映されます。`,
  },
  parameters: {
    docs: {
      description: {
        story: '長いメッセージや複数行のメッセージを表示する例',
      },
    },
  },
};

// 使用例デモ
const AlertDialogDemo = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<
    'info' | 'warning' | 'error' | 'success'
  >('info');

  const showAlert = (type: 'info' | 'warning' | 'error' | 'success') => {
    setAlertType(type);
    setIsOpen(true);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <button
        onClick={() => showAlert('info')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
        }}
      >
        情報アラートを表示
      </button>
      <button
        onClick={() => showAlert('warning')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#eab308',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
        }}
      >
        警告アラートを表示
      </button>
      <button
        onClick={() => showAlert('error')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
        }}
      >
        エラーアラートを表示
      </button>
      <button
        onClick={() => showAlert('success')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
        }}
      >
        成功アラートを表示
      </button>

      <AlertDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type={alertType}
        title={
          alertType === 'info'
            ? '情報'
            : alertType === 'warning'
              ? '警告'
              : alertType === 'error'
                ? 'エラー'
                : '成功'
        }
        message={`${alertType}タイプのアラートダイアログです。`}
      />
    </div>
  );
};

export const InteractiveDemo = {
  render: () => <AlertDialogDemo />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ボタンをクリックして各タイプのアラートを表示するデモ',
      },
    },
  },
};
