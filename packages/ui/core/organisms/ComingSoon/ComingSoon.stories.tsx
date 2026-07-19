import { ComingSoon } from './ComingSoon';

/**
 * 予約済みだが未実装のルート用プレースホルダ。
 * <section> として描画されるので、親 layout の <main> にネストしても安全。
 */
export default {
  title: '表示/ComingSoon',
  component: ComingSoon,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
- **title**: 必須。見出し
- **description**: 補足説明（省略可）
- **hint**: 下部のヒント。デフォルトは「Phase 2 で実装予定」の日本語文
- **className**: 外側 <section> に追加するクラス
        `,
      },
    },
  },
  argTypes: {
    title: { control: { type: 'text' } },
    description: { control: { type: 'text' } },
    hint: { control: { type: 'text' } },
    className: { control: { type: 'text' } },
  },
};

// 標準表示
export const Default = {
  args: {
    title: 'バッジ',
    description: '獲得済みバッジと進行中の称号を一覧表示します。',
  },
  parameters: {
    docs: {
      description: { story: 'title + description のみ。hint はデフォルト文言。' },
    },
  },
};

// title のみ
export const TitleOnly = {
  args: {
    title: 'ランキング',
  },
  parameters: {
    docs: {
      description: { story: 'description を省略すると本文行は表示されない。' },
    },
  },
};

// hint カスタム
export const CustomHint = {
  args: {
    title: '監査ログ',
    description: '管理者向け操作履歴を一覧表示します。',
    hint: '本機能は管理者ロール解放後にリリースされます。',
  },
  parameters: {
    docs: {
      description: { story: 'hint を上書きしてリリース条件などを表示できる。' },
    },
  },
};

// hint なし
export const NoHint = {
  args: {
    title: 'ポートフォリオ',
    description: '受講履歴と取得認定を時系列で表示します。',
    hint: '',
  },
  parameters: {
    docs: {
      description: { story: 'hint に空文字を渡すと下部ヒントが消える。' },
    },
  },
};
