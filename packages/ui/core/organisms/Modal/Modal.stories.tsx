import React from 'react';

import { Modal } from './Modal';

/**
 * Modal コンポーネントの Storybook 設定
 */
export default {
  title: 'フィードバック/ダイアログ/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
汎用モーダルコンポーネント。
• カスタマイズ可能な幅と高さ
• Escキーで閉じることが可能
• 背景クリックで閉じることが可能
• スクロール可能なコンテンツエリア`,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
      description: 'モーダルの表示状態',
      table: { defaultValue: { summary: false } },
    },
    title: {
      control: { type: 'text' },
      description: 'モーダルのタイトル',
    },
    maxWidth: {
      control: { type: 'text' },
      description: 'モーダルの最大幅（Tailwindクラス）',
      table: { defaultValue: { summary: 'max-w-3xl' } },
    },
    maxHeight: {
      control: { type: 'text' },
      description: 'モーダルの最大高さ（Tailwindクラス）',
      table: { defaultValue: { summary: 'max-h-[80vh]' } },
    },
    onClose: {
      action: 'closed',
      description: '閉じるときのハンドラ',
    },
    children: {
      control: { type: 'text' },
      description: 'モーダル内に表示するコンテンツ',
    },
  },
};

// 基本的なモーダル
export const Default = {
  args: {
    isOpen: true,
    title: '基本的なモーダル',
    children: (
      <div>
        <p>これはモーダルのコンテンツです。</p>
        <p>複数の段落を含めることができます。</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '標準的なモーダルの表示例',
      },
    },
  },
};

// 小さいモーダル
export const Small = {
  args: {
    isOpen: true,
    title: '小さいモーダル',
    maxWidth: 'max-w-md',
    children: <p>これは小さいサイズのモーダルです。</p>,
  },
  parameters: {
    docs: {
      description: {
        story: '幅を狭くした小さいモーダル',
      },
    },
  },
};

// 大きいモーダル
export const Large = {
  args: {
    isOpen: true,
    title: '大きいモーダル',
    maxWidth: 'max-w-6xl',
    children: (
      <div>
        <p>これは大きいサイズのモーダルです。</p>
        <p>広いコンテンツを表示する場合に使用します。</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '幅を広くした大きいモーダル',
      },
    },
  },
};

// 長いコンテンツ（スクロール）
export const LongContent = {
  args: {
    isOpen: true,
    title: '長いコンテンツを持つモーダル',
    children: (
      <div>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          セクション1
        </h4>
        <p style={{ marginBottom: '1rem' }}>
          このモーダルは長いコンテンツを含んでいます。コンテンツエリアはスクロール可能です。
        </p>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          セクション2
        </h4>
        <p style={{ marginBottom: '1rem' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          セクション3
        </h4>
        <p style={{ marginBottom: '1rem' }}>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
        </p>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          セクション4
        </h4>
        <p style={{ marginBottom: '1rem' }}>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur.
        </p>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          セクション5
        </h4>
        <p style={{ marginBottom: '1rem' }}>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
          officia deserunt mollit anim id est laborum.
        </p>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          セクション6
        </h4>
        <p>
          これで長いコンテンツが終わります。スクロールして確認してください。
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '長いコンテンツを持つモーダル。コンテンツエリアがスクロール可能',
      },
    },
  },
};

// フォームを含むモーダル
export const WithForm = {
  args: {
    isOpen: true,
    title: 'ユーザー情報の編集',
    children: (
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: '500',
            }}
          >
            名前
          </label>
          <input
            type="text"
            placeholder="山田太郎"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: '500',
            }}
          >
            メールアドレス
          </label>
          <input
            type="email"
            placeholder="example@example.com"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: '500',
            }}
          >
            自己紹介
          </label>
          <textarea
            placeholder="自己紹介を入力してください"
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'end' }}>
          <button
            type="button"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            保存
          </button>
        </div>
      </form>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'フォームを含むモーダルの例',
      },
    },
  },
};

// 使用例デモ
const ModalDemo = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        モーダルを開く
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="デモモーダル">
        <div>
          <p style={{ marginBottom: '1rem' }}>
            これはモーダルのデモです。以下の方法で閉じることができます：
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>右上の×ボタンをクリック</li>
            <li>Escキーを押す</li>
            <li>背景（暗い部分）をクリック</li>
          </ul>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </Modal>
    </div>
  );
};

export const InteractiveDemo = {
  render: () => <ModalDemo />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ボタンをクリックしてモーダルを開くインタラクティブなデモ',
      },
    },
  },
};
