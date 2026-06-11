import React from 'react';



import { Button } from '../Button';

/**
 * Button コンポーネントの Storybook 設定
 */
export default {
  title: '入力/ボタン/Button',
  component: Button, // ドキュメントやアドオンで参照されるコンポーネント本体
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ZTvv6vzLXOxlP64TLs6YHB/%E7%84%A1%E9%A1%8C?t=uGI62GQBWdy1FqLU-0',
    },
    // 全ストーリー共通のレイアウト設定
    layout: 'centered',
    // 背景色のプリセット
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f7fafc' },
        { name: 'dark', value: '#1a202c' },
        {
          name: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      ],
    },
    docs: {
      // コンポーネント説明(Docsタブの上部に表示)
      description: {
        component: `
多様なスタイルとサイズに対応する Button コンポーネント。
• 6 種類のバリアント(primary, secondary, default, outline, danger, success)
• 3 種類のサイズ(small, medium, large)
• 無効化状態(disabled) もサポート
• アイコン対応(leftIcon, rightIcon)
• ホップエフェクト(enableHopEffect) - ホバー時に上に浮き上がる、元の位置もクリック可能
• シェイクエフェクト(triggerShake) - 成功通知などで左右に振動`,
      },
    },
  },
  // controls とドキュメント向けの引数設定
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'primary',
        'secondary',
        'default',
        'outline',
        'danger',
        'success',
      ],
      description: 'バリアント(色やスタイル)を指定',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'サイズ(small, medium, large)を指定',
      table: { defaultValue: { summary: 'medium' } },
    },
    disabled: {
      control: { type: 'boolean' },
      description: '無効化状態を設定',
      table: { defaultValue: { summary: false } },
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のハンドラ(action が動作します)',
    },
    children: {
      control: { type: 'text' },
      description: 'ボタン内のテキストや要素',
    },
    enableHopEffect: {
      control: { type: 'boolean' },
      description: 'ホバー時のホップエフェクトを有効化',
      table: { defaultValue: { summary: true } },
    },
    triggerShake: {
      control: { type: 'boolean' },
      description: 'シェイクアニメーションをトリガー',
      table: { defaultValue: { summary: false } },
    },
    leftIcon: {
      control: { type: 'text' },
      description: '左側に表示するアイコン名',
      table: { defaultValue: { summary: undefined } },
    },
    rightIcon: {
      control: { type: 'text' },
      description: '右側に表示するアイコン名',
      table: { defaultValue: { summary: undefined } },
    },
    iconSize: {
      control: { type: 'number' },
      description: 'アイコンのサイズ(px)',
      table: { defaultValue: { summary: 'auto' } },
    },
  },
};

// -------------------------------------------------------
// 以下、各ストーリーの定義
// -------------------------------------------------------

// デフォルトボタン(未指定時の標準)
export const Default = {
  args: {
    variant: 'default',
    children: 'デフォルトボタン',
  },
  parameters: {
    docs: {
      description: {
        story: 'variant未指定時の標準的なデフォルトボタン(グレー背景・黒文字)',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button variant="default">デフォルトボタン</Button>`,
      },
    },
  },
};

// プライマリボタン
export const Primary = {
  args: {
    variant: 'primary',
    children: 'プライマリボタン',
  },
  parameters: {
    docs: {
      description: {
        story: '主要なアクションに使用する標準的なプライマリボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button variant="primary">プライマリボタン</Button>`,
      },
    },
  },
};

// セカンダリボタン
export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'セカンダリボタン',
  },
  parameters: {
    docs: {
      description: {
        story:
          '強調したい補助的なアクションに使用するセカンダリボタン(黒背景・白文字)',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button variant="secondary">セカンダリボタン</Button>`,
      },
    },
  },
};

// アウトラインボタン
export const Outline = {
  args: {
    variant: 'outline',
    children: 'アウトラインボタン',
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: '枠線のみのミニマルなデザインのボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button variant="outline">アウトラインボタン</Button>`,
      },
    },
  },
};

// 危険ボタン(削除などの操作向け)
export const Danger = {
  args: {
    variant: 'danger',
    children: '削除する',
  },
  parameters: {
    docs: {
      description: {
        story: '削除などの危険な操作に使用する警告色ボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button variant="danger">削除する</Button>`,
      },
    },
  },
};

// 成功ボタン(完了などの操作向け)
export const Success = {
  args: {
    variant: 'success',
    children: '保存完了',
  },
  parameters: {
    docs: {
      description: {
        story: '成功状態や完了した操作を示す緑色ボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button variant="success">保存完了</Button>`,
      },
    },
  },
};

// サイズバリエーションのデモ
export const Sizes = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button size="small">小サイズ</Button>
      <Button size="medium">中サイズ</Button>
      <Button size="large">大サイズ</Button>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '3つのサイズ(small, medium, large)を並べて表示',
        // transform の対象外なので明示的に code を書く場合はここだけ例外
        source: {
          code: `
import { Button } from './Button/Button';

<Button size="small">小サイズ</Button>
<Button size="medium">中サイズ</Button>
<Button size="large">大サイズ</Button>
          `.trim(),
        },
      },
    },
  },
};

// すべてのバリアントと無効状態をまとめて表示
export const AllVariants = {
  args: {},
  render: () => (
    <div style={{ display: 'space-y-1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Button>デフォルト</Button>
        <Button variant="primary">プライマリ</Button>
        <Button variant="secondary">セカンダリ</Button>
        <Button variant="outline">アウトライン</Button>
        <Button variant="danger">危険</Button>
        <Button variant="success">成功</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button disabled>デフォルト(無効)</Button>
        <Button variant="primary" disabled>
          プライマリ(無効)
        </Button>
        <Button variant="secondary" disabled>
          セカンダリ(無効)
        </Button>
        <Button variant="outline" disabled>
          アウトライン(無効)
        </Button>
        <Button variant="danger" disabled>
          危険(無効)
        </Button>
        <Button variant="success" disabled>
          成功(無効)
        </Button>
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light' },
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '全バリアントとその無効状態をまとめて確認',
        // renderベースなので明示的 code が必要
        source: {
          code: `import { Button } from './Button/Button';

<Button>デフォルト</Button>
<Button variant="primary">プライマリ</Button>
<Button variant="secondary">セカンダリ</Button>
<Button variant="outline">アウトライン</Button>
<Button variant="danger">危険</Button>
<Button variant="success">成功</Button>

<Button disabled>デフォルト(無効)</Button>
<Button variant="primary" disabled>プライマリ(無効)</Button>
<Button variant="secondary" disabled>セカンダリ(無効)</Button>
<Button variant="outline" disabled>アウトライン(無効)</Button>
<Button variant="danger" disabled>危険(無効)</Button>
<Button variant="success" disabled>成功(無効)</Button>
          `.trim(),
        },
      },
    },
  },
};

// 無効化ボタン単体
export const Disabled = {
  args: {
    disabled: true,
    children: '無効ボタン',
  },
  parameters: {
    docs: {
      description: {
        story: 'クリックできない無効化されたボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button disabled>無効ボタン</Button>`,
      },
    },
  },
};

// 長いテキストでもレイアウト崩れなし
export const LongText = {
  args: {
    children: 'とても長いテキストを持つボタンの例',
  },
  parameters: {
    docs: {
      description: {
        story: '長いテキストでも適切に表示されることを確認',
      },
      source: {
        code: `import { Button } from './Button/Button';

<Button>とても長いテキストを持つボタンの例</Button>`,
      },
    },
  },
};

// アイコン付きボタンの例
export const WithIcon = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          追加
        </span>
      </Button>
      <Button variant="danger">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
              01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1
              0 00-1 1v3M4 7h16"
            />
          </svg>
          削除
        </span>
      </Button>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: 'アイコンを含むカスタムコンテンツの例',
      },
    },
  },
};

// ID付きボタン(テスト用)
export const WithTestIds = {
  args: {},
  render: () => (
    <div className="space-y-4">
      <div className="rounded bg-gray-50 p-4">
        <h3 className="mb-3 text-fluid-sm font-semibold text-gray-700">
          テスト自動化用のID付きボタン例
        </h3>
        <div className="flex gap-4">
          <Button id="save-button" variant="primary">
            保存
          </Button>
          <Button id="cancel-button" variant="secondary">
            キャンセル
          </Button>
          <Button id="delete-button" variant="danger">
            削除
          </Button>
        </div>
      </div>
      <div className="rounded bg-blue-50 p-4">
        <h3 className="mb-3 text-fluid-sm font-semibold text-blue-700">
          埋め込み用のID付きボタン例
        </h3>
        <div className="flex gap-4">
          <Button id="widget-btn-1" size="small">
            Widget Button 1
          </Button>
          <Button id="widget-btn-2" size="small" variant="outline">
            Widget Button 2
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'テスト自動化や外部サイト埋め込みで使用するID付きボタンの例。E2Eテストやセレンターゲットとして活用できます。',
      },
      source: {
        code: `import { Button } from './components/atoms/Button';

// テスト自動化用
<Button id="save-button" variant="primary">保存</Button>
<Button id="cancel-button" variant="secondary">キャンセル</Button>
<Button id="delete-button" variant="danger">削除</Button>

// 埋め込み用(複数ウィジェット識別)
<Button id="widget-btn-1" size="small">Widget Button 1</Button>
<Button id="widget-btn-2" size="small" variant="outline">Widget Button 2</Button>

// JavaScript からの操作例：
// document.getElementById('save-button').click();
// document.querySelector('#cancel-button').disabled = true;`,
      },
    },
  },
};

// ホップエフェクトの比較
export const HopEffect = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Button variant="primary" enableHopEffect={true}>
          ホップ有効
        </Button>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          ホバーで上に浮く
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Button variant="primary" enableHopEffect={false}>
          ホップ無効
        </Button>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          通常のホバー
        </p>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'ホバー時にボタンが上に浮き上がるホップエフェクトの有無を比較。元の位置もクリック可能な設計。',
      },
    },
  },
};

// シェイクエフェクトのデモ
const ShakeEffectComponent = () => {
  const [isShaking, setIsShaking] = React.useState(false);

  const handleClick = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 1200);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Button
        variant="success"
        triggerShake={isShaking}
        onClick={handleClick}
        leftIcon={'unlock'}
      >
        認証完了
      </Button>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        クリックするとボタンのアイコンが左右に振動します（Unlockアイコン）
      </p>
    </div>
  );
};

export const ShakeEffect = {
  args: {},
  render: () => <ShakeEffectComponent />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'クリック時にボタンが左右に振動するシェイクエフェクト。成功通知などに使用できます。',
      },
    },
  },
};

// ログイン成功デモ
const LoginSuccessComponent = () => {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 500);
    }, 1500);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Button
        variant={isSuccess ? 'success' : 'primary'}
        triggerShake={isSuccess}
        onClick={handleLogin}
        disabled={isLoading}
        leftIcon={isSuccess ? 'lock' : undefined}
      >
        {isLoading ? 'ログイン中...' : isSuccess ? 'ログイン成功' : 'ログイン'}
      </Button>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        ログイン成功時にロックアイコンと振動エフェクトを表示
      </p>
    </div>
  );
};

export const LoginSuccess = {
  args: {},
  render: () => <LoginSuccessComponent />,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          'ログイン成功時のUXデモ。ボタンクリック → ローディング → 成功(緑色+ロックアイコン+振動)',
      },
    },
  },
};

// 左アイコン付きボタン
export const WithLeftIcon = {
  args: {
    variant: 'primary',
    leftIcon: 'arrow-in',
    children: '追加',
  },
  parameters: {
    docs: {
      description: {
        story: '左側にアイコンを配置したボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';


<Button variant="primary" leftIcon={'arrow-in'}>追加</Button>`,
      },
    },
  },
};

// 右アイコン付きボタン
export const WithRightIcon = {
  args: {
    variant: 'default',
    rightIcon: 'chevron-right',
    children: '次へ',
  },
  parameters: {
    docs: {
      description: {
        story: '右側にアイコンを配置したボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';


<Button variant="default" rightIcon={'chevron-right'}>次へ</Button>`,
      },
    },
  },
};

// 両側アイコン付きボタン
export const WithBothIcons = {
  args: {
    variant: 'secondary',
    leftIcon: 'arrow-in',
    rightIcon: 'chevron-down',
    children: 'ダウンロード',
  },
  parameters: {
    docs: {
      description: {
        story: '左右両側にアイコンを配置したボタン',
      },
      source: {
        code: `import { Button } from './Button/Button';


<Button variant="secondary" leftIcon={'arrow-in'} rightIcon={'chevron-down'}>ダウンロード</Button>`,
      },
    },
  },
};

// アイコンバリエーション
export const IconVariations = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary" leftIcon={'arrow-in'}>
        追加
      </Button>
      <Button variant="danger" leftIcon={'x'}>
        削除
      </Button>
      <Button variant="success" leftIcon={'info-circle'}>
        完了
      </Button>
      <Button variant="default" leftIcon={'gear'}>
        編集
      </Button>
      <Button variant="outline" leftIcon={'magnifying-glass'}>
        検索
      </Button>
      <Button variant="primary" rightIcon={'chevron-right'}>
        次へ
      </Button>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story: '様々なアイコンとバリアントの組み合わせ例',
      },
    },
  },
};
