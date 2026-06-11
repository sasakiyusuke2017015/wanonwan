import { ResponsiveContainer } from './ResponsiveContainer';

/**
 * ResponsiveContainer コンポーネントの Storybook 設定
 */
export default {
  title: 'レイアウト/ResponsiveContainer',
  component: ResponsiveContainer, // ドキュメントやアドオンで参照されるコンポーネント本体
  tags: ['autodocs'],
  parameters: {
    // 全ストーリー共通のレイアウト設定
    layout: 'fullscreen',
    // 背景色のプリセット
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f7fafc' },
        { name: 'dark', value: '#1a202c' },
        { name: 'gray', value: '#e2e8f0' },
      ],
    },
    docs: {
      // コンポーネント説明(Docsタブの上部に表示)
      description: {
        component: `
高さ制限とスクロール機能を提供するレスポンシブな ResponsiveContainer コンポーネント。
• heightPercent プロパティでビューポート高さの％を指定
• 完全にレスポンシブで画面サイズに自動対応
• overflow-y-auto で縦スクロールを自動化
• キーボードナビゲーション対応(enableKeyboardNav)
• フォーカス管理とキーボードイベントハンドリング`,
      },
      // ソースコード表示を args ベースで動的生成
      source: {
        transform: (_: string, storyContext: { args: Record<string, unknown> }) => {
          const { args } = storyContext;
          const props = [];

          // デフォルト値と異なる場合のみ props に追加
          if (args.heightPercent && args.heightPercent !== 60) {
            props.push(`heightPercent={${args.heightPercent}}`);
          }
          if (args.className) {
            props.push(`className="${args.className}"`);
          }
          if (args.enableKeyboardNav) {
            props.push('enableKeyboardNav');
          }
          if (args.onKeyDown) {
            props.push('onKeyDown={handleKeyDown}');
          }
          if (args.tabIndex) {
            props.push(`tabIndex={${args.tabIndex}}`);
          }
          if (args.disableScroll) {
            props.push('disableScroll');
          }

          // props を文字列化
          const propsString = props.length > 0 ? ' ' + props.join(' ') : '';

          // インポートパスも含めて返却
          return `
import { ResponsiveContainer } from './ResponsiveContainer';

<ResponsiveContainer${propsString}>
  {/* コンテンツをここに配置 */}
</ResponsiveContainer>
          `.trim();
        },
      },
    },
  },
  // controls とドキュメント向けの引数設定
  argTypes: {
    heightPercent: {
      control: { type: 'number', min: 20, max: 95, step: 5 },
      description: 'ビューポート高さの％(20-95%)',
      table: { defaultValue: { summary: '60' } },
    },
    className: {
      control: { type: 'text' },
      description: '追加のCSSクラス名',
      table: { defaultValue: { summary: "''" } },
    },
    enableKeyboardNav: {
      control: { type: 'boolean' },
      description: 'キーボードナビゲーションを有効化',
      table: { defaultValue: { summary: 'false' } },
    },
    onKeyDown: {
      action: 'keydown',
      description: 'キーダウンイベントハンドラ',
    },
    tabIndex: {
      control: { type: 'number' },
      description: 'タブインデックス(enableKeyboardNav時のみ有効)',
    },
    disableScroll: {
      control: { type: 'boolean' },
      description: 'スクロールを無効化(内部でスクロール管理する場合)',
      table: { defaultValue: { summary: 'false' } },
    },
    showDebugInfo: {
      control: { type: 'boolean' },
      description: 'デバッグ情報を表示(heightPercent値を右上に表示)',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      description: 'コンテナ内に表示するコンテンツ',
    },
  },
};

// -------------------------------------------------------
// 以下、各ストーリーの定義
// -------------------------------------------------------

// 基本的な使用例(デフォルト)
export const Default = {
  args: {
    heightPercent: 60,
    children: (
      <div className="space-y-4 p-6">
        <h2 className="text-fluid-xl font-bold text-gray-800">基本的な使用例</h2>
        <p className="text-gray-600">
          このコンテナは高さが制限され、コンテンツが溢れる場合は自動的にスクロールします。
        </p>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="rounded-lg border bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-800">
              コンテンツ項目 {i + 1}
            </h3>
            <p className="text-blue-600">
              これはスクロール動作を確認するためのサンプルコンテンツです。
            </p>
          </div>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '標準的な使用例。heightPercent=60%でビューポート高さの60%の高さに設定されます。',
      },
    },
  },
};

// 高さのバリエーション
export const HeightVariations = {
  args: {},
  render: () => (
    <div className="grid h-screen grid-cols-3 gap-4 p-4">
      <div>
        <h3 className="mb-2 text-fluid-sm font-bold">heightPercent: 30%</h3>
        <ResponsiveContainer
          heightPercent={30}
          className="border-2 border-red-200 bg-red-50"
        >
          <div className="p-4">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="mb-2 rounded bg-red-100 p-2">
                項目 {i + 1}
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-2 text-fluid-sm font-bold">
          heightPercent: 60% (デフォルト)
        </h3>
        <ResponsiveContainer
          heightPercent={60}
          className="border-2 border-blue-200 bg-blue-50"
        >
          <div className="p-4">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="mb-2 rounded bg-blue-100 p-2">
                項目 {i + 1}
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-2 text-fluid-sm font-bold">heightPercent: 80%</h3>
        <ResponsiveContainer
          heightPercent={80}
          className="border-2 border-green-200 bg-green-50"
        >
          <div className="p-4">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="mb-2 rounded bg-green-100 p-2">
                項目 {i + 1}
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        story:
          '異なるheightPercent値での比較。％指定により画面サイズに完全対応します。',
      },
    },
  },
};

// レスポンシブ動作の確認
export const ResponsiveBehavior = {
  args: {
    heightPercent: 70,
    className:
      'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg',
    children: (
      <div className="space-y-4 p-6">
        <h2 className="text-fluid-xl font-bold text-cyan-800">
          レスポンシブ動作テスト
        </h2>
        <div className="rounded-lg bg-white/70 p-4">
          <h3 className="mb-2 font-semibold text-cyan-700">動作説明</h3>
          <ul className="space-y-1 text-fluid-sm text-cyan-600">
            <li>• デスクトップ: ビューポート高さの70%</li>
            <li>• タブレット: ビューポート高さの70%</li>
            <li>• モバイル: ビューポート高さの70%(最小21vh)</li>
            <li>• ブラウザをリサイズして確認してください</li>
          </ul>
        </div>
        <div className="rounded bg-gray-100 p-3 text-fluid-xs text-gray-500">
          現在の設定: height=70vh, minHeight=21vh, maxHeight=70vh
        </div>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="rounded border border-cyan-200 bg-cyan-100 p-3"
          >
            <h4 className="font-medium text-cyan-800">
              テストコンテンツ {i + 1}
            </h4>
            <p className="text-fluid-sm text-cyan-600">
              レスポンシブコンテナの動作確認用のコンテンツです。
            </p>
          </div>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'レスポンシブ動作の確認。ブラウザをリサイズして高さの変化を確認できます。',
      },
    },
  },
};

// キーボードナビゲーション対応
export const WithKeyboardNavigation = {
  args: {
    enableKeyboardNav: true,
    tabIndex: 0,
    className:
      'border-2 border-blue-500 focus:border-blue-700 focus:outline-none',
    children: (
      <div className="space-y-4 p-6">
        <h2 className="text-fluid-xl font-bold text-gray-800">
          キーボードナビゲーション有効
        </h2>
        <p className="text-blue-600">
          このコンテナはフォーカス可能です。クリックまたはTabキーでフォーカスし、
          矢印キーでスクロールできます。
        </p>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="rounded-lg border bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-800">
              フォーカス可能項目 {i + 1}
            </h3>
            <p className="text-yellow-600">
              このコンテナはキーボードでナビゲーション可能です。
            </p>
          </div>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'キーボードナビゲーションが有効な例。フォーカス可能でキーボードイベントを受け取ります。',
      },
    },
  },
};

// 実際のデータテーブル風のコンテンツ
export const TableLikeContent = {
  args: {
    heightPercent: 65,
    className: 'bg-white shadow-lg rounded-lg',
    children: (
      <div>
        {/* ヘッダー */}
        <div className="rounded-t-lg bg-gray-800 p-4 text-white">
          <h2 className="text-fluid-lg font-bold">データ一覧</h2>
        </div>

        {/* テーブルヘッダー */}
        <div className="border-b bg-gray-100">
          <div className="grid grid-cols-4 gap-4 p-3 font-semibold text-gray-700">
            <div>ID</div>
            <div>名前</div>
            <div>部署</div>
            <div>ステータス</div>
          </div>
        </div>

        {/* テーブルボディ(スクロール対象) */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 25 }, (_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 p-3 hover:bg-gray-50"
            >
              <div className="text-gray-600">#{i + 1}</div>
              <div className="font-medium">ユーザー {i + 1}</div>
              <div className="text-gray-600">
                {['開発部', '営業部', '人事部', 'マーケティング部'][i % 4]}
              </div>
              <div>
                <span
                  className={`rounded-full px-2 py-1 text-fluid-xs font-medium ${
                    i % 3 === 0
                      ? 'bg-green-100 text-green-800'
                      : i % 3 === 1
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {i % 3 === 0
                    ? 'アクティブ'
                    : i % 3 === 1
                      ? '保留中'
                      : '非アクティブ'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '実際のデータテーブルのような構造でのResponsiveContainer使用例。ヘッダーは固定され、データ部分がスクロールします。',
      },
    },
  },
};

// カスタムクラス適用例
export const WithCustomStyling = {
  args: {
    heightPercent: 55,
    className:
      'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-lg',
    children: (
      <div className="space-y-4 p-6">
        <h2 className="text-fluid-2xl font-bold text-purple-800">
          カスタムスタイリング
        </h2>
        <p className="text-purple-600">
          ResponsiveContainerにカスタムクラスを適用した例です。
          グラデーション背景、ボーダー、シャドウなどが適用されています。
        </p>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="rounded-lg border border-purple-200 bg-white/70 p-4 backdrop-blur"
          >
            <h3 className="font-semibold text-purple-800">
              カスタムスタイル項目 {i + 1}
            </h3>
            <p className="text-purple-600">
              美しいグラデーションとガラス効果が適用されたコンテンツエリアです。
            </p>
          </div>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'カスタムCSSクラスを適用したスタイリング例。グラデーション、ボーダー、シャドウなどの装飾が可能です。',
      },
    },
  },
};

// 最小高さでのコンテンツ(スクロールなし)
export const MinimalContent = {
  args: {
    heightPercent: 40,
    className: 'bg-gray-50 border rounded-lg',
    children: (
      <div className="p-6 text-center">
        <h2 className="mb-4 text-fluid-lg font-bold text-gray-800">最小コンテンツ</h2>
        <p className="text-gray-600">
          このコンテンツは高さが十分に小さいため、スクロールは表示されません。
        </p>
        <div className="mt-4 rounded bg-blue-100 p-3">
          <p className="text-fluid-sm text-blue-800">
            ResponsiveContainerは必要に応じてスクロールを表示します。
          </p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'コンテンツが少ない場合の表示例。スクロールは表示されず、通常のコンテナとして動作します。',
      },
    },
  },
};

// スクロール無効化の例
export const DisabledScroll = {
  args: {
    heightPercent: 45,
    disableScroll: true,
    className: 'bg-orange-50 border-2 border-orange-200 rounded-lg',
    children: (
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 bg-orange-100 p-3">
          <h3 className="font-semibold text-orange-800">ヘッダー(固定)</h3>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <h2 className="mb-4 text-fluid-lg font-bold text-orange-800">
            内部でスクロール管理
          </h2>
          <p className="mb-4 text-orange-600">
            ResponsiveContainerのスクロールを無効化し、内部の要素でスクロールを管理します。
          </p>
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="mb-2 rounded bg-orange-100 p-3">
              内部スクロール項目 {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'disableScroll=trueの例。テーブルなどで内部の特定要素だけスクロールさせたい場合に使用。',
      },
    },
  },
};
