import type { Meta, StoryObj } from "@storybook/react";
import { DetailHeader } from "./DetailHeader";
import { Icon } from "../../atoms/Icon/Icon";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

const meta: Meta<typeof DetailHeader> = {
  title: "レイアウト/DetailHeader",
  component: DetailHeader,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, padding: 16, background: "var(--color-bg, #f5f5f5)" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DetailHeader>;

const sampleFields = [
  { label: "タイプ", value: "Issues" },
  {
    label: "サーバー",
    value: "http://192.168.10.64/items/18/index",
    onClick: () => alert("open URL"),
    mono: true,
  },
  {
    label: "ローカル",
    value: "C:\\Users\\NT-210174\\Desktop\\sites\\プロトタイプ版\\掲載設定",
    mono: true,
  },
];

/** テキストラベル付きアクション */
const textActions = [
  { label: "取得", onClick: () => {}, variant: "primary" as const },
  { label: "反映", onClick: () => {}, variant: "default" as const },
  { label: "フォルダを開く", onClick: () => {}, variant: "outline" as const },
];

/** アイコンのみアクション（ホバーでツールチップ） */
const iconActions = [
  {
    label: "",
    onClick: () => {},
    variant: "outline" as const,
    icon: <Tooltip content="サーバーから取得"><Icon name="sync-pull" size={14} stroke="currentColor" /></Tooltip>,
  },
  {
    label: "",
    onClick: () => {},
    variant: "outline" as const,
    icon: <Tooltip content="サーバーへ反映"><Icon name="sync-push" size={14} stroke="currentColor" /></Tooltip>,
  },
  {
    label: "",
    onClick: () => {},
    variant: "outline" as const,
    icon: <Tooltip content="フォルダを開く"><Icon name="folder" size={14} stroke="currentColor" /></Tooltip>,
  },
];

/** コンパクト: 1カード縦積み（テキストラベル） */
export const Compact: Story = {
  args: {
    variant: "compact",
    icon: "📊",
    title: "掲載設定",
    fields: sampleFields,
    actions: textActions,
  },
};

/** スプリット: 左に情報、右にアクション（テキストラベル） */
export const Split: Story = {
  args: {
    variant: "split",
    icon: "📊",
    title: "掲載設定",
    fields: sampleFields,
    actions: textActions,
  },
};

/** ミニマル: ボーダーレス超軽量（アイコンのみ + ツールチップ） */
export const Minimal: Story = {
  args: {
    variant: "minimal",
    icon: "📊",
    title: "掲載設定",
    fields: sampleFields,
    actions: iconActions,
  },
};

/** 3パターン比較 */
export const Comparison: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#666" }}>1. Compact（テキストラベル）</h3>
        <DetailHeader
          variant="compact"
          icon="📊"
          title="掲載設定"
          fields={sampleFields}
          actions={textActions}
        />
      </div>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#666" }}>2. Split（テキストラベル）</h3>
        <DetailHeader
          variant="split"
          icon="📊"
          title="掲載設定"
          fields={sampleFields}
          actions={textActions}
        />
      </div>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#666" }}>3. Minimal（アイコンのみ）</h3>
        <DetailHeader
          variant="minimal"
          icon="📊"
          title="掲載設定"
          fields={sampleFields}
          actions={iconActions}
        />
      </div>
    </div>
  ),
};
