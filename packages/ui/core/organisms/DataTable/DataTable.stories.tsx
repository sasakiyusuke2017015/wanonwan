import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './DataTable'

const meta: Meta<typeof DataTable> = {
  title: 'データ表示/テーブル/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTable>

const headers = ['name', 'status', 'score', 'date']
const rows = [
  ['田中 太郎', 'active', '4.5', '2024-01-15'],
  ['佐藤 花子', 'inactive', '3.2', '2024-02-20'],
  ['鈴木 一郎', 'active', '5.0', '2024-03-01'],
  ['高橋 美咲', 'pending', '2.8', '2024-03-10'],
  ['伊藤 健太', 'active', '4.1', '2024-03-15'],
]

export const Default: Story = {
  args: { headers, rows },
}

export const WithLabels: Story = {
  args: {
    headers,
    rows,
    headerLabels: { name: '氏名', status: 'ステータス', score: 'スコア', date: '日付' },
    cellLabels: {
      status: { active: '有効', inactive: '無効', pending: '保留中' },
    },
  },
}

export const Selectable: Story = {
  args: {
    headers,
    rows,
    selectable: true,
    headerLabels: { name: '氏名', status: 'ステータス', score: 'スコア', date: '日付' },
  },
}
