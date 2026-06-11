import type { Meta, StoryObj } from '@storybook/react';

import { Dropdown, DropdownItem, DropdownDivider } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'ナビゲーション/メニュー/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    width: {
      control: 'number',
      description: 'ドロップダウンの幅',
    },
    maxHeight: {
      control: 'number',
      description: '最大高さ（スクロール時）',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    trigger: <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>メニュー</button>,
    width: 192,
    children: (
      <>
        <DropdownItem onClick={() => {}}>項目 1</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 2</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 3</DropdownItem>
      </>
    ),
  },
};

export const WithSelectedItem: Story = {
  name: '選択状態あり',
  args: {
    trigger: <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>フィルター</button>,
    width: 200,
    children: (
      <>
        <DropdownItem onClick={() => {}}>すべて</DropdownItem>
        <DropdownItem onClick={() => {}} isSelected>進行中</DropdownItem>
        <DropdownItem onClick={() => {}}>完了</DropdownItem>
      </>
    ),
  },
};

export const WithDivider: Story = {
  name: '区切り線あり',
  args: {
    trigger: <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>操作</button>,
    width: 200,
    children: (
      <>
        <DropdownItem onClick={() => {}}>編集</DropdownItem>
        <DropdownItem onClick={() => {}}>複製</DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={() => {}}>削除</DropdownItem>
      </>
    ),
  },
};

export const WithDisabledItem: Story = {
  name: '無効項目あり',
  args: {
    trigger: <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>アクション</button>,
    width: 200,
    children: (
      <>
        <DropdownItem onClick={() => {}}>保存</DropdownItem>
        <DropdownItem onClick={() => {}} disabled>エクスポート（権限なし）</DropdownItem>
        <DropdownItem onClick={() => {}}>共有</DropdownItem>
      </>
    ),
  },
};

export const WithMaxHeight: Story = {
  name: 'スクロールあり',
  args: {
    trigger: <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>長いリスト</button>,
    width: 200,
    maxHeight: 150,
    children: (
      <>
        <DropdownItem onClick={() => {}}>項目 1</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 2</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 3</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 4</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 5</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 6</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 7</DropdownItem>
        <DropdownItem onClick={() => {}}>項目 8</DropdownItem>
      </>
    ),
  },
};
