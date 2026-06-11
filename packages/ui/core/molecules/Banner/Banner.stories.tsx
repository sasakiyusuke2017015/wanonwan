import { Banner } from './Banner';

/**
 * 汎用バナーコンポーネント
 *
 * 情報、警告、成功、エラーなどの通知を表示するバナー。
 */
export default {
  title: '表示/バナー/Banner',
  component: Banner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Bannerコンポーネント。以下の機能をサポート:

- **4種類のバリアント**: info, warning, success, error
- **タイトル**: オプショナルなタイトル表示
- **メッセージ**: 必須のメッセージテキスト（ReactNode も可）
- **アイコン**: 各バリアントに対応したデフォルトアイコン
- **カスタマイズ可能**: classNameでスタイル拡張、アイコン非表示、カスタムアイコン

ページ上部やセクション内での通知表示に使用します。
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['info', 'warning', 'success', 'error'],
      description: 'バナーの種類',
    },
    title: {
      control: { type: 'text' },
      description: 'タイトル（省略可）',
    },
    message: {
      control: { type: 'text' },
      description: 'メッセージ（必須）',
    },
    className: {
      control: { type: 'text' },
      description: '追加のクラス名',
    },
    showIcon: {
      control: { type: 'boolean' },
      description: 'アイコンを表示するか',
    },
    icon: {
      control: { type: 'text' },
      description: 'カスタムアイコン名',
    },
  },
};

// 情報バナー
export const Info = {
  args: {
    variant: 'info',
    title: 'お知らせ',
    message: 'システムメンテナンスを実施します。',
  },
  parameters: {
    docs: {
      description: {
        story: '一般的な情報を伝える青色のバナー。',
      },
    },
  },
};

// 警告バナー
export const Warning = {
  args: {
    variant: 'warning',
    title: '注意',
    message: '入力内容を確認してください。',
  },
  parameters: {
    docs: {
      description: {
        story: '注意喚起のための黄色のバナー。',
      },
    },
  },
};

// 成功バナー
export const Success = {
  args: {
    variant: 'success',
    title: '成功',
    message: 'データの保存が完了しました。',
  },
  parameters: {
    docs: {
      description: {
        story: '成功メッセージを表示する緑色のバナー。',
      },
    },
  },
};

// エラーバナー
export const Error = {
  args: {
    variant: 'error',
    title: 'エラー',
    message: 'データの読み込みに失敗しました。',
  },
  parameters: {
    docs: {
      description: {
        story: 'エラーメッセージを表示する赤色のバナー。',
      },
    },
  },
};

// タイトルなし
export const WithoutTitle = {
  args: {
    variant: 'info',
    message: 'タイトルなしのシンプルなメッセージです。',
  },
  parameters: {
    docs: {
      description: {
        story: 'タイトルを省略したシンプルな表示。',
      },
    },
  },
};

// アイコンなし
export const WithoutIcon = {
  args: {
    variant: 'info',
    message: 'アイコンなしのシンプルなバナーです。',
    showIcon: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'showIcon={false} でアイコンを非表示にできます。',
      },
    },
  },
};

// カスタムアイコン
export const CustomIcon = {
  args: {
    variant: 'info',
    title: 'カスタムアイコン',
    message: 'デフォルト以外のアイコンを指定できます。',
    icon: 'bell',
  },
  parameters: {
    docs: {
      description: {
        story: 'icon プロパティでカスタムアイコンを指定できます。',
      },
    },
  },
};

// 全バリアント比較
export const AllVariants = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <Banner
        variant="info"
        title="情報"
        message="これは情報バナーです。一般的なお知らせに使用します。"
      />
      <Banner
        variant="warning"
        title="警告"
        message="これは警告バナーです。注意が必要な情報を表示します。"
      />
      <Banner
        variant="success"
        title="成功"
        message="これは成功バナーです。操作の完了を知らせます。"
      />
      <Banner
        variant="error"
        title="エラー"
        message="これはエラーバナーです。問題が発生したことを通知します。"
      />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '4種類のバリアントを並べて比較できます。',
      },
    },
  },
};

// 長いメッセージ
export const LongMessage = {
  args: {
    variant: 'warning',
    title: '重要なお知らせ',
    message:
      'このメッセージは非常に長いテキストを含んでいます。システムの変更により、一部の機能が影響を受ける可能性があります。詳細については管理者にお問い合わせください。',
  },
  parameters: {
    docs: {
      description: {
        story: '長いメッセージでも適切に表示されます。',
      },
    },
  },
};

// カスタムスタイル
export const CustomStyle = {
  args: {
    variant: 'info',
    title: 'カスタムスタイル',
    message: 'カスタムクラスを適用した例です。',
    className: 'shadow-lg border-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'classNameプロパティで追加のスタイルを適用できます。',
      },
    },
  },
};

// ページレイアウト例
export const PageLayoutExample = {
  render: () => (
    <div className="w-full max-w-4xl">
      <Banner
        variant="warning"
        title="メンテナンス予定"
        message="2025年1月15日 22:00-24:00にシステムメンテナンスを実施します。"
        className="mb-6"
      />
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-fluid-xl font-bold text-gray-800">
          ページコンテンツ
        </h2>
        <p className="text-gray-600">
          バナーはページ上部に配置して重要な情報を目立たせることができます。
        </p>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'ページレイアウトでの使用例。上部に配置して目立たせます。',
      },
    },
  },
};

// 複数バナーの配置
export const MultipleBanners = {
  render: () => (
    <div className="w-full max-w-2xl space-y-3">
      <Banner
        variant="error"
        message="エラー: ネットワーク接続に失敗しました。"
      />
      <Banner
        variant="warning"
        message="警告: 未保存の変更があります。"
      />
      <Banner
        variant="info"
        message="情報: 新しいバージョンが利用可能です。"
      />
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '複数のバナーを同時に表示する例。優先度順に並べます。',
      },
    },
  },
};
