import type { Meta, StoryObj } from '@storybook/react';

import { StatisticPanel } from './StatisticPanel';
import type { StatisticPanelItem, StatusDefinition } from './StatisticPanel';

const meta: Meta<typeof StatisticPanel> = {
  title: 'データ表示/統計/StatisticPanel',
  component: StatisticPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof StatisticPanel>;

const statusDefs: Record<string, StatusDefinition> = {
  active: { value: 1, color: 'green', label: '稼働中', shortLabel: '稼働' },
  pending: { value: 2, color: 'yellow', label: '保留中', shortLabel: '保留' },
  inactive: { value: 3, color: 'gray', label: '停止中', shortLabel: '停止' },
};

const sampleItems: StatisticPanelItem[] = [
  { statusDef: statusDefs.active, value: 25 },
  { statusDef: statusDefs.pending, value: 8 },
  { statusDef: statusDefs.inactive, value: 3 },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    totalLabel: '全',
    totalValue: 36,
    totalUnit: '名',
  },
};

export const Loading: Story = {
  args: {
    items: sampleItems,
    totalLabel: '全',
    totalValue: 36,
    totalUnit: '名',
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    totalValue: 0,
    emptyMessage: 'データがありません',
  },
};
