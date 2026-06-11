import { useState } from 'react';

import type { Meta } from '@storybook/react';

import { TransferList } from './TransferList';
import type { TransferListItem } from './types';

const meta: Meta<typeof TransferList> = {
  title: 'データ操作/TransferList',
  component: TransferList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

const initialLeft: TransferListItem[] = [
  { id: '1', label: '田中太郎', subLabel: '営業部' },
  { id: '2', label: '鈴木花子', subLabel: '開発部' },
  { id: '3', label: '佐藤一郎', subLabel: '人事部' },
  { id: '4', label: '山田次郎', subLabel: '総務部', disabled: true, disabledReason: '管理者' },
];

const initialRight: TransferListItem[] = [
  { id: '5', label: '高橋三郎', subLabel: '営業部' },
];

const InteractiveExample = () => {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);

  return (
    <TransferList
      leftItems={left}
      rightItems={right}
      leftLabel="有効なユーザー"
      rightLabel="無効なユーザー"
      toRightLabel="無効化 \u2192"
      toLeftLabel="\u2190 有効化"
      onChange={(newLeft, newRight) => {
        setLeft(newLeft);
        setRight(newRight);
      }}
    />
  );
};

export const Default = {
  render: () => <InteractiveExample />,
};

const EmptyExample = () => {
  const [left, setLeft] = useState<TransferListItem[]>([]);
  const [right, setRight] = useState<TransferListItem[]>([]);

  return (
    <TransferList
      leftItems={left}
      rightItems={right}
      leftLabel="左リスト"
      rightLabel="右リスト"
      onChange={(newLeft, newRight) => {
        setLeft(newLeft);
        setRight(newRight);
      }}
    />
  );
};

export const Empty = {
  render: () => <EmptyExample />,
};

const manyItems: TransferListItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: String(i + 1),
  label: `メンバー ${i + 1}`,
  subLabel: ['営業部', '開発部', '人事部', '総務部', 'マーケティング部'][i % 5],
}));

const ManyItemsExample = () => {
  const [left, setLeft] = useState(manyItems);
  const [right, setRight] = useState<TransferListItem[]>([]);

  return (
    <TransferList
      leftItems={left}
      rightItems={right}
      leftLabel="全メンバー"
      rightLabel="選択済み"
      toRightLabel="追加 →"
      toLeftLabel="← 戻す"
      onChange={(newLeft, newRight) => {
        setLeft(newLeft);
        setRight(newRight);
      }}
    />
  );
};

export const ManyItems = {
  render: () => <ManyItemsExample />,
};

const disabledItems: TransferListItem[] = [
  { id: '1', label: '管理者A', subLabel: 'システム管理者', disabled: true, disabledReason: 'システム管理者は移動不可' },
  { id: '2', label: '管理者B', subLabel: 'データベース管理者', disabled: true, disabledReason: 'DB管理者は移動不可' },
  { id: '3', label: '一般ユーザー A', subLabel: '営業部' },
  { id: '4', label: '一般ユーザー B', subLabel: '開発部' },
  { id: '5', label: '一般ユーザー C', subLabel: '人事部' },
];

const WithDisabledExample = () => {
  const [left, setLeft] = useState(disabledItems);
  const [right, setRight] = useState<TransferListItem[]>([]);

  return (
    <TransferList
      leftItems={left}
      rightItems={right}
      leftLabel="アクティブ"
      rightLabel="無効化"
      toRightLabel="無効化 →"
      toLeftLabel="← 有効化"
      onChange={(newLeft, newRight) => {
        setLeft(newLeft);
        setRight(newRight);
      }}
    />
  );
};

export const WithDisabledItems = {
  render: () => <WithDisabledExample />,
};

const PrefilledExample = () => {
  const [left, setLeft] = useState<TransferListItem[]>([
    { id: '1', label: 'React', subLabel: 'フロントエンド' },
    { id: '2', label: 'Vue', subLabel: 'フロントエンド' },
  ]);
  const [right, setRight] = useState<TransferListItem[]>([
    { id: '3', label: 'Node.js', subLabel: 'バックエンド' },
    { id: '4', label: 'Python', subLabel: 'バックエンド' },
    { id: '5', label: 'Go', subLabel: 'バックエンド' },
  ]);

  return (
    <TransferList
      leftItems={left}
      rightItems={right}
      leftLabel="使用中の技術"
      rightLabel="検討中の技術"
      toRightLabel="検討へ →"
      toLeftLabel="← 採用"
      onChange={(newLeft, newRight) => {
        setLeft(newLeft);
        setRight(newRight);
      }}
    />
  );
};

export const Prefilled = {
  render: () => <PrefilledExample />,
};
