import type { Meta, StoryObj } from '@storybook/react';

import { ProjectItem } from './ProjectItem';

const meta: Meta<typeof ProjectItem> = {
  title: 'ナビゲーション/メニュー/ProjectItem',
  component: ProjectItem,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    selected: {
      control: 'boolean',
      description: '選択状態',
    },
    isDragging: {
      control: 'boolean',
      description: 'ドラッグ中状態',
    },
    isDragOver: {
      control: 'boolean',
      description: 'ドラッグオーバー状態',
    },
    isDropTarget: {
      control: 'boolean',
      description: 'ドロップターゲット状態',
    },
    isMeetingDropTarget: {
      control: 'boolean',
      description: 'ミーティングのドロップターゲット状態',
    },
    isLastChild: {
      control: 'boolean',
      description: '同階層の最後の子かどうか',
    },
    onClick: {
      action: 'onClick',
      description: 'クリックハンドラ',
    },
    onDoubleClick: {
      action: 'onDoubleClick',
      description: 'ダブルクリックハンドラ',
    },
    onContextMenu: {
      action: 'onContextMenu',
      description: '右クリックハンドラ',
    },
    onDelete: {
      action: 'onDelete',
      description: '削除ハンドラ',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectItem>;

export const Default: Story = {
  args: {
    project: { id: '1', name: 'プロジェクト A', depth: 0 },
    selected: false,
    onClick: () => {},
  },
  decorators: [(Story) => <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '4px' }}><Story /></div>],
};

export const Selected: Story = {
  name: '選択状態',
  args: {
    project: { id: '1', name: 'プロジェクト A', depth: 0 },
    selected: true,
    onClick: () => {},
  },
  decorators: [(Story) => <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '4px' }}><Story /></div>],
};

export const WithDeleteButton: Story = {
  name: '削除ボタン付き',
  args: {
    project: { id: '1', name: 'プロジェクト A', depth: 0 },
    selected: false,
    onClick: () => {},
    onDelete: () => {},
  },
  decorators: [(Story) => <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '4px' }}><Story /></div>],
};

export const TreeStructure: Story = {
  name: 'ツリー構造',
  render: () => (
    <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '4px', display: 'flex', flexDirection: 'column' }}>
      <ProjectItem
        project={{ id: '1', name: '親プロジェクト', depth: 0 }}
        selected
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '2', name: '子プロジェクト 1', depth: 1, parent_id: '1' }}
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '3', name: '子プロジェクト 2', depth: 1, parent_id: '1' }}
        isLastChild
        onClick={() => {}}
      />
    </div>
  ),
};

export const DeepNesting: Story = {
  name: '深いネスト',
  render: () => (
    <div style={{ width: '280px', backgroundColor: '#1e293b', padding: '4px', display: 'flex', flexDirection: 'column' }}>
      <ProjectItem
        project={{ id: '1', name: 'ルート', depth: 0 }}
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '2', name: 'レベル 1', depth: 1, parent_id: '1' }}
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '3', name: 'レベル 2', depth: 2, parent_id: '2' }}
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '4', name: 'レベル 3', depth: 3, parent_id: '3' }}
        selected
        isLastChild
        onClick={() => {}}
      />
    </div>
  ),
};

export const DragStates: Story = {
  name: 'ドラッグ状態',
  render: () => (
    <div style={{ width: '220px', backgroundColor: '#1e293b', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <ProjectItem
        project={{ id: '1', name: '通常', depth: 0 }}
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '2', name: 'ドラッグ中', depth: 0 }}
        isDragging
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '3', name: 'ドラッグオーバー', depth: 0 }}
        isDragOver
        onClick={() => {}}
      />
      <ProjectItem
        project={{ id: '4', name: 'ドロップターゲット', depth: 0 }}
        isDropTarget
        onClick={() => {}}
      />
    </div>
  ),
};
