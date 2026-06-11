import { DevelopmentBanner } from './DevelopmentBanner';

/**
 * 開発中バナーコンポーネント
 *
 * 開発中の機能を示すバナー。
 * Bannerコンポーネントのラッパーで、warningバリアントを使用します。
 */
export default {
  title: '表示/バナー/DevelopmentBanner',
  component: DevelopmentBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
DevelopmentBannerコンポーネント。

- **固定タイトル**: 「開発中」というタイトルが自動設定
- **warningバリアント**: 黄色のバナーで注意を促す
- **簡潔なAPI**: messageプロパティのみで使用可能

開発中の機能やベータ版ページで使用します。
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
    message: 'この機能は現在開発中です。予期しない動作が発生する可能性があります。',
  },
  parameters: {
    docs: {
      description: {
        story: '基本的な開発中バナー。',
      },
    },
  },
};

// 短いメッセージ
export const ShortMessage = {
  args: {
    message: '開発中の機能です。',
  },
  parameters: {
    docs: {
      description: {
        story: '短いメッセージでの表示例。',
      },
    },
  },
};

// ベータ版通知
export const BetaNotice = {
  args: {
    message:
      'この機能はベータ版です。フィードバックをお待ちしております。',
  },
  parameters: {
    docs: {
      description: {
        story: 'ベータ版機能の通知に使用する例。',
      },
    },
  },
};

// 詳細な説明
export const DetailedMessage = {
  args: {
    message:
      '現在、この機能は開発中です。一部の機能が利用できない、または不安定な動作をする可能性があります。問題が発生した場合はサポートまでご連絡ください。',
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
      <DevelopmentBanner
        message="新しいダッシュボードは現在開発中です。一部の機能が正常に動作しない場合があります。"
        className="mb-6"
      />
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-fluid-xl font-bold text-gray-800">
          新しいダッシュボード
        </h2>
        <p className="text-gray-600">
          開発中の機能に関する注意事項を上部バナーで表示しています。
        </p>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ページ上部に配置して開発中であることを警告する例。',
      },
    },
  },
};

// 複数バナーの併用
export const MultipleBanners = {
  render: () => (
    <div className="w-full max-w-2xl space-y-3">
      <DevelopmentBanner message="機能A: 開発中です。" />
      <DevelopmentBanner message="機能B: ベータ版としてリリースしました。" />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '複数の開発中機能を同時に通知する例。',
      },
    },
  },
};
