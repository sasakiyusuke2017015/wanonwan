import type { Meta, StoryObj } from '@storybook/react';
import { TagItem } from './TagItem';

type Story = StoryObj<typeof TagItem>;

/**
 * タグアイテムコンポーネント
 *
 * ドラッグ可能なタグアイテム。チェックボックス風の選択UIとカラードット表示を備えます。
 */
const meta: Meta<typeof TagItem> = {
  title: 'ナビゲーション/メニュー/TagItem',
  component: TagItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tag: {
      description: 'タグデータ（id, name, color）',
      control: { type: 'object' },
    },
    selected: {
      description: '選択状態',
      control: { type: 'boolean' },
    },
    isDragging: {
      description: 'ドラッグ中状態',
      control: { type: 'boolean' },
    },
    isDragOver: {
      description: 'ドラッグオーバー状態',
      control: { type: 'boolean' },
    },
    checkColor: {
      description: 'チェックマークのアクセントカラー',
      control: { type: 'select' },
      options: ['blue', 'purple'],
    },
  },
};

export default meta;

// デフォルト
export const Default: Story = {
  args: {
    tag: { id: '1', name: '重要', color: 'red' },
    selected: false,
    onClick: () => {},
  },
};

// 選択状態
export const Selected: Story = {
  args: {
    tag: { id: '1', name: '重要', color: 'red' },
    selected: true,
    onClick: () => {},
  },
};

// 紫チェックカラー
export const PurpleCheck: Story = {
  args: {
    tag: { id: '2', name: 'アイデア', color: 'purple' },
    selected: true,
    checkColor: 'purple',
    onClick: () => {},
  },
};

// 削除ボタン付き
export const WithDelete: Story = {
  args: {
    tag: { id: '3', name: '一時的', color: 'orange' },
    selected: false,
    onClick: () => {},
    onDelete: () => {},
  },
};

// カラーバリエーション
export const ColorVariations: Story = {
  render: () => {
    const colors = ['red', 'blue', 'green', 'orange', 'purple', 'teal', 'pink', 'indigo', 'yellow'];
    return (
      <div className="flex flex-col gap-1">
        {colors.map((color) => (
          <TagItem
            key={color}
            tag={{ id: color, name: color, color }}
            selected={false}
            onClick={() => {}}
          />
        ))}
      </div>
    );
  },
};

// 選択リスト例
export const SelectionList: Story = {
  render: () => {
    const tags = [
      { id: '1', name: '重要', color: 'red' },
      { id: '2', name: '進行中', color: 'blue' },
      { id: '3', name: '完了', color: 'green' },
      { id: '4', name: '保留', color: 'gray' },
    ];
    return (
      <div className="flex flex-col gap-1 w-56">
        {tags.map((tag, i) => (
          <TagItem
            key={tag.id}
            tag={tag}
            selected={i < 2}
            onClick={() => {}}
            onDelete={() => {}}
          />
        ))}
      </div>
    );
  },
};
