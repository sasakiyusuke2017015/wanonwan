import { AsyncActionButton } from './AsyncActionButton';

/**
 * 非同期アクションをトリガーするボタン。
 * クリック中は自動で disabled + pendingLabel に切り替わる。
 */
export default {
  title: 'アクション/AsyncActionButton',
  component: AsyncActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
業務ロジックは onAction に渡す Promise として呼び出し側に置く。
catalog 側はローディング状態 (disabled + pendingLabel) のみを管理する。

- **onAction**: \`() => Promise<unknown>\` — 完了/失敗どちらも finally で解除
- **pendingLabel**: ローディング中の文言（省略時は通常文言のまま disabled）
- **onError**: 失敗時のハンドラ。未指定なら例外を投げ直す
- 他の prop は Button にスルーで渡る（variant / size / type / className）
        `,
      },
    },
  },
};

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// 通常時
export const Default = {
  args: {
    onAction: () => delay(1200),
    children: '受講開始',
    pendingLabel: '登録中…',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: { story: '通常状態。クリックすると 1.2 秒間ローディング表示になる。' },
    },
  },
};

// pendingLabel 指定例
export const WithPendingLabel = {
  args: {
    onAction: () => delay(1500),
    children: '保存',
    pendingLabel: '保存中…',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: { story: 'pendingLabel を指定するとローディング中の表示が切り替わる。' },
    },
  },
};

// pendingLabel 未指定（文言据え置き）
export const WithoutPendingLabel = {
  args: {
    onAction: () => delay(1500),
    children: '送信',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: { story: 'pendingLabel を省略すると、文言は変わらず disabled になる。' },
    },
  },
};

// エラー時
export const ErrorHandled = {
  args: {
    onAction: async () => {
      await delay(800);
      throw new Error('意図的な失敗');
    },
    onError: (err: unknown) => {
      // Storybook 上では console に出すだけ。実アプリでは toast / alert に置き換える
      console.warn('AsyncActionButton onError:', err);
    },
    children: '失敗するアクション',
    pendingLabel: '実行中…',
    variant: 'danger',
  },
  parameters: {
    docs: {
      description: { story: 'onError 指定時は例外を投げ直さず、ハンドラに委ねる。' },
    },
  },
};

// 強制 disabled
export const Disabled = {
  args: {
    onAction: () => delay(500),
    children: '受講開始',
    disabled: true,
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: { story: '外部から disabled を渡すとローディング状態と独立に無効化できる。' },
    },
  },
};
