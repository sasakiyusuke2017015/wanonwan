import type { Meta, StoryObj } from '@storybook/react';

import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'ナビゲーション/タブ/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'overview', label: '概要', content: <p>概要コンテンツ</p> },
      { id: 'details', label: '詳細', content: <p>詳細コンテンツ</p> },
      { id: 'settings', label: '設定', content: <p>設定コンテンツ</p> },
    ],
  },
};

export const WithDefaultTab: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: 'タブ1', content: <p>タブ1のコンテンツ</p> },
      { id: 'tab2', label: 'タブ2', content: <p>タブ2のコンテンツ</p> },
      { id: 'tab3', label: 'タブ3', content: <p>タブ3のコンテンツ</p> },
    ],
    defaultTab: 'tab2',
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'active', label: '有効', content: <p>有効なアイテムの一覧</p> },
      { id: 'inactive', label: '無効', content: <p>無効なアイテムの一覧</p> },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: 'all', label: 'すべて', content: <p>すべてのデータ</p> },
      { id: 'draft', label: '下書き', content: <p>下書き一覧</p> },
      { id: 'review', label: 'レビュー中', content: <p>レビュー待ちの項目</p> },
      { id: 'approved', label: '承認済み', content: <p>承認済み一覧</p> },
      { id: 'rejected', label: '却下', content: <p>却下された項目</p> },
      { id: 'archived', label: 'アーカイブ', content: <p>アーカイブ済み</p> },
    ],
  },
};

/**
 * タブ数が多く、コンテナ幅に収まりきらないケース。
 * `.tabs__list` の `flex-wrap: wrap` で切れ / 潰れずに段落ちする
 * (マスタ管理のようにカテゴリタブが増えても破綻しない)。
 * 幅を絞った wrapper で折り返しを確定させ VRT で固定する。
 */
export const OverflowWrapsToRows: Story = {
  decorators: [
    (StoryFn) => (
      <div style={{ width: 420 }}>
        <StoryFn />
      </div>
    ),
  ],
  args: {
    defaultTab: 'company',
    tabs: [
      { id: 'company', label: '会社', content: <p>会社マスタ</p> },
      { id: 'department', label: '部署', content: <p>部署マスタ</p> },
      { id: 'jobtype', label: '職種', content: <p>職種マスタ</p> },
      { id: 'role', label: '役割', content: <p>役割マスタ</p> },
      { id: 'level', label: 'レベル', content: <p>レベルマスタ</p> },
      { id: 'category', label: 'カテゴリ', content: <p>カテゴリマスタ</p> },
      { id: 'exam', label: '試験', content: <p>試験マスタ</p> },
      { id: 'notification', label: '通知テンプレート', content: <p>通知テンプレート</p> },
      { id: 'tag', label: 'タグ', content: <p>タグマスタ</p> },
      { id: 'status', label: 'ステータス', content: <p>ステータスマスタ</p> },
      { id: 'permission', label: '権限', content: <p>権限マスタ</p> },
      { id: 'segment', label: '区分', content: <p>区分マスタ</p> },
    ],
  },
};

export const WithRichContent: Story = {
  args: {
    tabs: [
      {
        id: 'profile',
        label: 'プロフィール',
        content: (
          <div style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 8px' }}>田中 太郎</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>tanaka@example.com</p>
            <p style={{ color: '#6b7280', margin: '4px 0 0' }}>営業部 / マネージャー</p>
          </div>
        ),
      },
      {
        id: 'activity',
        label: 'アクティビティ',
        content: (
          <ul style={{ padding: '16px 16px 16px 32px', margin: 0 }}>
            <li>レポートを提出しました (2分前)</li>
            <li>コメントを追加しました (1時間前)</li>
            <li>タスクを完了しました (3時間前)</li>
          </ul>
        ),
      },
      {
        id: 'settings',
        label: '設定',
        content: (
          <div style={{ padding: 16, color: '#6b7280' }}>
            通知・セキュリティ等の設定項目がここに表示されます。
          </div>
        ),
      },
    ],
  },
};

/**
 * link mode の基本例。
 *
 * URL 駆動のタブ navigation。`<a href>` を出すので middle-click 新タブ /
 * 右クリック リンクコピー / SEO が成立する。`activeId` は呼び出し側 (URL の
 * 状態を解釈する Server Component など) が決定する。
 *
 * Storybook iframe では `href` が relative のため preview iframe 内を遷移する。
 * 実環境での middle-click / リンクコピーの動作確認は `/admin/questions` で行う。
 */
export const LinkMode: Story = {
  args: {
    mode: 'link',
    tabs: [
      { id: 'cert', label: '認定試験', href: '?purpose=cert' },
      { id: 'check', label: '理解度チェック', href: '?purpose=check' },
    ],
    activeId: 'cert',
  },
};

/**
 * Next.js Link 等の framework router をインジェクトする例。
 *
 * `renderAnchor` で全 prop を spread すると `aria-current` も自動で渡る。
 *
 * ```tsx
 * import Link from 'next/link'
 *
 * <Tabs
 *   mode="link"
 *   tabs={[...]}
 *   activeId={purpose}
 *   renderAnchor={(props) => <Link {...props} />}
 * />
 * ```
 *
 * Story では Next.js を使わないので、`data-source="custom"` を付与した
 * カスタム anchor で挙動を可視化する。
 */
export const LinkModeWithCustomAnchor: Story = {
  args: {
    mode: 'link',
    tabs: [
      { id: 'all', label: 'すべて', href: '?filter=all' },
      { id: 'mine', label: '自分のみ', href: '?filter=mine' },
      { id: 'team', label: 'チーム', href: '?filter=team' },
    ],
    activeId: 'mine',
    renderAnchor: ({ href, className, children, ...rest }) => (
      <a data-source="custom-router" href={href} className={className} {...rest}>
        {children}
      </a>
    ),
  },
};

/**
 * link mode で activeId が未一致 (どのタブも active でない) のとき。
 *
 * URL に対応するタブが無いケース (例: 想定外 query param)。
 * いずれの anchor にも `aria-current="page"` が付かない。
 */
export const LinkModeNoActive: Story = {
  args: {
    mode: 'link',
    tabs: [
      { id: 'cert', label: '認定試験', href: '?purpose=cert' },
      { id: 'check', label: '理解度チェック', href: '?purpose=check' },
    ],
    activeId: 'unknown',
  },
};
