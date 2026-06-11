import { useState } from 'react';

import { Toast } from './Toast';

/**
 * Toastコンポーネント
 *
 * オーバーレイなしで画面隅に表示される通知。
 * 成功メッセージやエラー通知などに使用します。
 */
export default {
  title: 'フィードバック/通知/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Toastコンポーネント。以下の機能をサポート:

- **4つのタイプ**: info, warning, error, success
- **4つの位置**: top-right, top-left, bottom-right, bottom-left
- **自動クローズ**: durationで自動的に閉じる時間を設定
- **アニメーション**: スライドイン/アウトのアニメーション
- **カスタマイズ**: borderRadiusで角丸を調整

成功通知、エラーメッセージ、情報表示などに使用します。
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      description: 'トーストの表示/非表示',
      control: 'boolean',
    },
    message: {
      description: 'トーストに表示するメッセージ',
      control: 'text',
    },
    type: {
      description: 'トーストのタイプ（色・アイコンが変わる）',
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
    },
    duration: {
      description: '自動クローズまでの時間(ms)。0で自動クローズ無効',
      control: 'number',
    },
    position: {
      description: 'トーストの表示位置',
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
    borderRadius: {
      description: '角丸のサイズ（CSS値）',
      control: 'text',
    },
    onClose: { action: 'closed' },
  },
};

// 情報トースト
const InfoToastExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
      >
        情報トーストを表示
      </button>
      <Toast
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="データの読み込みが完了しました。"
        type="info"
        duration={3000}
      />
    </div>
  );
};

export const Info = {
  render: () => <InfoToastExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '情報を通知する青色のトースト（3秒後に自動で閉じる）。',
      },
    },
  },
};

// 成功トースト
const SuccessToastExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-green-500 px-6 py-3 text-white hover:bg-green-600"
      >
        成功トーストを表示
      </button>
      <Toast
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="保存が完了しました。"
        type="success"
        duration={3000}
      />
    </div>
  );
};

export const Success = {
  render: () => <SuccessToastExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '成功を通知する緑色のトースト。',
      },
    },
  },
};

// 警告トースト
const WarningToastExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-yellow-500 px-6 py-3 text-white hover:bg-yellow-600"
      >
        警告トーストを表示
      </button>
      <Toast
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="ネットワーク接続が不安定です。"
        type="warning"
        duration={3000}
      />
    </div>
  );
};

export const Warning = {
  render: () => <WarningToastExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '警告を表示する黄色のトースト。',
      },
    },
  },
};

// エラートースト
const ErrorToastExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-red-500 px-6 py-3 text-white hover:bg-red-600"
      >
        エラートーストを表示
      </button>
      <Toast
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="エラーが発生しました。もう一度お試しください。"
        type="error"
        duration={3000}
      />
    </div>
  );
};

export const Error = {
  render: () => <ErrorToastExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'エラーを通知する赤色のトースト。',
      },
    },
  },
};

// 位置バリエーション
const PositionsExample = () => {
  const [position, setPosition] = useState<
    'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  >('top-right');
  const [isOpen, setIsOpen] = useState(false);

  const showToast = (
    pos: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  ) => {
    setPosition(pos);
    setIsOpen(true);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="space-y-4">
        <h2 className="text-center text-fluid-xl font-bold text-gray-800">
          表示位置を選択
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => showToast('top-left')}
            className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            左上
          </button>
          <button
            onClick={() => showToast('top-right')}
            className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            右上
          </button>
          <button
            onClick={() => showToast('bottom-left')}
            className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            左下
          </button>
          <button
            onClick={() => showToast('bottom-right')}
            className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            右下
          </button>
        </div>
      </div>
      <Toast
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message={`トーストが${
          position === 'top-right'
            ? '右上'
            : position === 'top-left'
              ? '左上'
              : position === 'bottom-right'
                ? '右下'
                : '左下'
        }に表示されました`}
        type="info"
        position={position}
        duration={3000}
      />
    </div>
  );
};

export const Positions = {
  render: () => <PositionsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '4つの表示位置（top-right, top-left, bottom-right, bottom-left）。',
      },
    },
  },
};

// 自動クローズなし
const NoAutoCloseExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-teal-500 px-6 py-3 text-white hover:bg-teal-600"
      >
        自動クローズなし
      </button>
      <Toast
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="このトーストは手動で閉じるまで表示され続けます。"
        type="info"
        duration={0}
      />
    </div>
  );
};

export const NoAutoClose = {
  render: () => <NoAutoCloseExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'duration=0で自動クローズを無効化。手動で閉じる必要があります。',
      },
    },
  },
};

// 複数トースト（順次表示）
const MultipleToastsExample = () => {
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: 'info' | 'success' | 'error' }>
  >([]);
  let nextId = 0;

  const addToast = (
    message: string,
    type: 'info' | 'success' | 'error'
  ) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="space-y-4">
        <h2 className="text-center text-fluid-xl font-bold text-gray-800">
          複数トーストのテスト
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => addToast('情報が追加されました', 'info')}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            情報を追加
          </button>
          <button
            onClick={() => addToast('保存に成功しました', 'success')}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            成功を追加
          </button>
          <button
            onClick={() => addToast('保存に失敗しました。時間をおいて再度お試しください。', 'error')}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            エラーを追加
          </button>
        </div>
      </div>
      {toasts.map((toast, _index) => (
        <Toast
          key={toast.id}
          isOpen={true}
          onClose={() => removeToast(toast.id)}
          message={toast.message}
          type={toast.type}
          position="bottom-right"
          duration={3000}
        />
      ))}
    </div>
  );
};

export const MultipleToasts = {
  render: () => <MultipleToastsExample />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          '複数のトーストを表示する例。重なって表示される可能性があるため、実装時は位置調整が必要です。',
      },
    },
  },
};
