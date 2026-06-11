import type { Meta, StoryObj } from '@storybook/react'
import { ModalCheckboxList } from './ModalCheckboxList'

const meta: Meta<typeof ModalCheckboxList> = {
  title: 'フォーム/フィールド/ModalCheckboxList',
  component: ModalCheckboxList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ModalCheckboxList>

const items = [
  { id: '1', label: '田中 太郎', description: 'エンジニア' },
  { id: '2', label: '佐藤 花子', description: 'デザイナー' },
  { id: '3', label: '鈴木 一郎', description: 'PM' },
  { id: '4', label: '高橋 美咲', description: 'QA' },
]

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'メンバーを選択',
    description: '参加するメンバーを選択してください',
    items,
    onConfirm: (ids) => console.log('confirmed', ids),
    onCancel: () => console.log('cancelled'),
  },
}

export const RequireSelection: Story = {
  args: {
    isOpen: true,
    title: 'メンバーを選択（必須）',
    items,
    requireSelection: true,
    onConfirm: (ids) => console.log('confirmed', ids),
    onCancel: () => console.log('cancelled'),
  },
}

export const Closed: Story = {
  args: {
    isOpen: false,
    title: '非表示',
    items,
    onConfirm: () => {},
    onCancel: () => {},
  },
}
