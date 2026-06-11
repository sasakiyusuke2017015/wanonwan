import React from 'react';

import { ConfirmDialog } from './ConfirmDialog';

/**
 * ConfirmDialog コンポーネントの Storybook 設定
 */
export default {
  title: 'フィードバック/ダイアログ/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
window.confirmの代替として使用する確認ダイアログコンポーネント。
• 4種類のタイプ(info, warning, error, danger)
• Escキーでキャンセル可能
• 背景クリックでキャンセル可能
• 確認とキャンセルの2つのボタン`,
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
      options: ['info', 'warning', 'error', 'danger'],
      description: '確認ダイアログのタイプ',
      table: { defaultValue: { summary: 'info' } },
    },
    title: {
      control: { type: 'text' },
      description: 'ダイアログのタイトル',
    },
    message: {
      control: { type: 'text' },
      description: '確認メッセージ',
    },
    confirmText: {
      control: { type: 'text' },
      description: '確認ボタンのテキスト',
      table: { defaultValue: { summary: '確定' } },
    },
    cancelText: {
      control: { type: 'text' },
      description: 'キャンセルボタンのテキスト',
      table: { defaultValue: { summary: 'キャンセル' } },
    },
    onConfirm: {
      action: 'confirmed',
      description: '確認ボタンクリック時のハンドラ',
    },
    onCancel: {
      action: 'cancelled',
      description: 'キャンセルボタンクリック時のハンドラ',
    },
  },
};

// 情報確認
export const Info = {
  args: {
    isOpen: true,
    type: 'info',
    title: '確認',
    message: 'この操作を続行してもよろしいですか？',
    confirmText: '続行する',
    cancelText: 'キャンセル',
  },
  parameters: {
    docs: {
      description: {
        story: '標準的な確認ダイアログ',
      },
    },
  },
};

// 警告確認
export const Warning = {
  args: {
    isOpen: true,
    type: 'warning',
    title: '警告',
    message: 'この操作は取り消せません。続行しますか？',
    confirmText: '続行',
    cancelText: 'キャンセル',
  },
  parameters: {
    docs: {
      description: {
        story: '注意が必要な操作の確認',
      },
    },
  },
};

// エラー確認
export const Error = {
  args: {
    isOpen: true,
    type: 'error',
    title: 'エラー',
    message: 'エラーが発生しました。再試行しますか？',
    confirmText: '再試行',
    cancelText: 'キャンセル',
  },
  parameters: {
    docs: {
      description: {
        story: 'エラー発生時の確認',
      },
    },
  },
};

// 危険な操作の確認
export const Danger = {
  args: {
    isOpen: true,
    type: 'danger',
    title: '削除の確認',
    message: 'このアイテムを完全に削除します。この操作は取り消せません。',
    confirmText: '削除する',
    cancelText: 'キャンセル',
  },
  parameters: {
    docs: {
      description: {
        story: '削除など危険な操作の確認（確認ボタンが赤色）',
      },
    },
  },
};

// タイトルなし
export const WithoutTitle = {
  args: {
    isOpen: true,
    type: 'info',
    message: '変更を保存しますか？',
    confirmText: '保存',
    cancelText: 'キャンセル',
  },
  parameters: {
    docs: {
      description: {
        story: 'タイトルを省略したシンプルな確認ダイアログ',
      },
    },
  },
};

// 長いメッセージ
export const LongMessage = {
  args: {
    isOpen: true,
    type: 'warning',
    title: '重要な確認',
    message: `この操作により、以下の変更が適用されます：

• すべてのデータが初期化されます
• 現在の設定が失われます
• 復元することはできません

本当に続行してもよろしいですか？`,
    confirmText: '続行',
    cancelText: 'キャンセル',
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
const ConfirmDialogDemo = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<
    'info' | 'warning' | 'error' | 'danger'
  >('info');
  const [result, setResult] = React.useState<string>('');

  const showDialog = (type: 'info' | 'warning' | 'error' | 'danger') => {
    setDialogType(type);
    setIsOpen(true);
    setResult('');
  };

  const handleConfirm = () => {
    setResult('確認されました');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setResult('キャンセルされました');
    setIsOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => showDialog('info')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          情報確認
        </button>
        <button
          onClick={() => showDialog('warning')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#eab308',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          警告確認
        </button>
        <button
          onClick={() => showDialog('error')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          エラー確認
        </button>
        <button
          onClick={() => showDialog('danger')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          危険な操作
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.25rem',
          }}
        >
          結果: {result}
        </div>
      )}

      <ConfirmDialog
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type={dialogType}
        title={
          dialogType === 'info'
            ? '確認'
            : dialogType === 'warning'
              ? '警告'
              : dialogType === 'error'
                ? 'エラー'
                : '削除の確認'
        }
        message={`${dialogType}タイプの確認ダイアログです。続行しますか？`}
        confirmText={dialogType === 'danger' ? '削除する' : '続行する'}
      />
    </div>
  );
};

export const InteractiveDemo = {
  render: () => <ConfirmDialogDemo />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ボタンをクリックして各タイプの確認ダイアログを表示するデモ',
      },
    },
  },
};
