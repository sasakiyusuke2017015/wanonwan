import { useState } from 'react';

import { Dialog } from '../Dialog/Dialog';

/**
 * 汎用ダイアログコンポーネント
 *
 * window.alert / window.confirmの代替となるダイアログ。
 * 統一されたデザインで通知や確認を行えます。
 */
export default {
  title: 'フィードバック/ダイアログ/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Dialogコンポーネント。以下の機能をサポート:

- **2つのバリアント**: alert (閉じるのみ), confirm (確定+キャンセル)
- **5つのタイプ**: info, warning, error, success, danger
- **キーボード対応**: Escキーで閉じる、Enterキー(alert)で確定
- **背景クリック**: 背景クリックで閉じる
- **カスタマイズ**: borderRadiusで角丸を調整

window.alert/confirmの代替として使用します。
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      description: 'ダイアログの表示/非表示',
      control: 'boolean',
    },
    title: {
      description: 'ダイアログのタイトル（省略可）',
      control: 'text',
    },
    message: {
      description: 'ダイアログのメッセージ',
      control: 'text',
    },
    type: {
      description: 'ダイアログのタイプ（色・アイコンが変わる）',
      control: 'select',
      options: ['info', 'warning', 'error', 'success', 'danger'],
    },
    variant: {
      description: 'alert: 閉じるのみ, confirm: 確定+キャンセル',
      control: 'select',
      options: ['alert', 'confirm'],
    },
    confirmText: {
      description: '確定ボタンのラベル',
      control: 'text',
    },
    cancelText: {
      description: 'キャンセルボタンのラベル（confirmのみ）',
      control: 'text',
    },
    borderRadius: {
      description: '角丸のサイズ（Tailwindクラス）',
      control: 'text',
    },
    onClose: { action: 'closed' },
    onConfirm: { action: 'confirmed' },
    onCancel: { action: 'cancelled' },
  },
};

// アラートダイアログ（info）
const AlertInfoExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        情報ダイアログを開く
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="お知らせ"
        message="データの保存が完了しました。"
        type="info"
        variant="alert"
      />
    </div>
  );
};

export const AlertInfo = {
  render: () => <AlertInfoExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '情報を通知するアラートダイアログ（青色）。',
      },
    },
  },
};

// アラートダイアログ（warning）
const AlertWarningExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
      >
        警告ダイアログを開く
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="警告"
        message="入力内容に不備があります。確認してください。"
        type="warning"
        variant="alert"
      />
    </div>
  );
};

export const AlertWarning = {
  render: () => <AlertWarningExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '警告を表示するアラートダイアログ（黄色）。',
      },
    },
  },
};

// アラートダイアログ（error）
const AlertErrorExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        エラーダイアログを開く
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="エラー"
        message="データの読み込みに失敗しました。再試行してください。"
        type="error"
        variant="alert"
      />
    </div>
  );
};

export const AlertError = {
  render: () => <AlertErrorExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'エラーを通知するアラートダイアログ（赤色）。',
      },
    },
  },
};

// 確認ダイアログ（danger）
const ConfirmDangerExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState('');

  const handleConfirm = () => {
    setResult('削除が実行されました');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setResult('キャンセルされました');
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => {
          setResult('');
          setIsOpen(true);
        }}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        削除確認ダイアログを開く
      </button>
      {result && (
        <p className="mt-2 text-fluid-sm text-gray-600">結果: {result}</p>
      )}
      <Dialog
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="確認"
        message="このデータを削除しますか？この操作は取り消せません。"
        type="danger"
        variant="confirm"
      />
    </div>
  );
};

export const ConfirmDanger = {
  render: () => <ConfirmDangerExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '危険な操作の確認ダイアログ。確定ボタンが赤色になります。',
      },
    },
  },
};

// 確認ダイアログ（info）
const ConfirmInfoExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState('');

  const handleConfirm = () => {
    setResult('保存されました');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setResult('キャンセルされました');
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => {
          setResult('');
          setIsOpen(true);
        }}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        保存確認ダイアログを開く
      </button>
      {result && (
        <p className="mt-2 text-fluid-sm text-gray-600">結果: {result}</p>
      )}
      <Dialog
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="保存確認"
        message="変更を保存しますか？"
        type="info"
        variant="confirm"
      />
    </div>
  );
};

export const ConfirmInfo = {
  render: () => <ConfirmInfoExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '一般的な確認ダイアログ。保存やアップロードなどに使用します。',
      },
    },
  },
};

// カスタムボタンラベル
const CustomLabelsExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        カスタムラベルダイアログを開く
      </button>
      <Dialog
        isOpen={isOpen}
        onConfirm={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        message="ファイルをダウンロードしますか？"
        type="success"
        variant="confirm"
        confirmText="ダウンロード"
        cancelText="後で"
      />
    </div>
  );
};

export const CustomLabels = {
  render: () => <CustomLabelsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'confirmText/cancelTextでボタンラベルをカスタマイズできます。',
      },
    },
  },
};

// タイトルなし
const NoTitleExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
      >
        タイトルなしダイアログを開く
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="タイトルがない場合は、アイコンが中央に大きく表示されます。"
        type="info"
        variant="alert"
      />
    </div>
  );
};

export const NoTitle = {
  render: () => <NoTitleExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'タイトルを省略した場合、アイコンが中央に表示されます。',
      },
    },
  },
};

// 全タイプ比較
export const AllTypes = {
  render: () => (
    <div className="space-y-4">
      <button
        onClick={() =>
          window.alert('これはブラウザ標準のalertです（比較用）')
        }
        className="w-full rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
      >
        標準alert（比較用）
      </button>
      {(['info', 'warning', 'error', 'success', 'danger'] as const).map(
        (type) => {
          const [isOpen, setIsOpen] = useState(false);
          return (
            <div key={type}>
              <button
                onClick={() => setIsOpen(true)}
                className={`w-full rounded px-4 py-2 text-white ${
                  type === 'info'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : type === 'warning'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : type === 'error'
                        ? 'bg-red-500 hover:bg-red-600'
                        : type === 'success'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {type.toUpperCase()}タイプを開く
              </button>
              <Dialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={type.toUpperCase()}
                message={`${type}タイプのダイアログです。`}
                type={type}
                variant="alert"
              />
            </div>
          );
        }
      )}
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '5種類のタイプを比較できます。',
      },
    },
  },
};
