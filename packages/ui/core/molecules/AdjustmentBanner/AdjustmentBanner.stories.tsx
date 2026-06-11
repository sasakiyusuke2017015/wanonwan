import { AdjustmentBanner } from './AdjustmentBanner';

/**
 * 調整中バナーコンポーネント
 *
 * 調整中の機能を示すバナー。
 * Bannerコンポーネントのラッパーで、infoバリアントを使用します。
 */
export default {
  title: '表示/バナー/AdjustmentBanner',
  component: AdjustmentBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
AdjustmentBannerコンポーネント。

- **固定タイトル**: 「調整中」というタイトルが自動設定
- **infoバリアント**: 青色のバナーで表示
- **簡潔なAPI**: messageプロパティのみで使用可能

調整中の機能やページで使用します。
        `,
      },
    },
  },
  argTypes: {
    message: {
      control: 'text',
      description: '説明文',
    },
    className: {
      control: 'text',
      description: '追加のクラス名',
    },
  },
};

// 基本的な使用例
export const Basic = {
  args: {
    message: 'この機能は現在調整中です。しばらくお待ちください。',
  },
  parameters: {
    docs: {
      description: {
        story: '基本的な調整中バナー。',
      },
    },
  },
};

// 短いメッセージ
export const ShortMessage = {
  args: {
    message: '調整中の機能です。',
  },
  parameters: {
    docs: {
      description: {
        story: '短いメッセージでの表示例。',
      },
    },
  },
};

// 詳細なメッセージ
export const DetailedMessage = {
  args: {
    message:
      '現在、この機能は調整作業を行っています。一部の機能が正常に動作しない場合があります。ご不便をおかけしますがご了承ください。',
  },
  parameters: {
    docs: {
      description: {
        story: '詳細な説明を含むメッセージ。',
      },
    },
  },
};

// ページレイアウト例
export const PageLayoutExample = {
  render: () => (
    <div className="w-full max-w-4xl">
      <AdjustmentBanner
        message="レポート機能は現在調整中です。一時的にデータが正しく表示されない場合があります。"
        className="mb-6"
      />
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-fluid-xl font-bold text-gray-800">レポート</h2>
        <p className="text-gray-600">
          調整中の機能に関する情報を上部バナーで表示しています。
        </p>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ページ上部に配置して調整中であることを通知する例。',
      },
    },
  },
};
