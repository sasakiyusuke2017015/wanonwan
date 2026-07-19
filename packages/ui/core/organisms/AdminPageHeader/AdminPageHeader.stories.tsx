import type { Meta, StoryObj } from '@storybook/react'
import { AdminPageHeader } from './AdminPageHeader'
import { StatusPill } from '../../atoms/StatusPill'

type Story = StoryObj<typeof AdminPageHeader>

const meta: Meta<typeof AdminPageHeader> = {
  title: 'コンテンツ/AdminPageHeader',
  component: AdminPageHeader,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta

const UserIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export const UserEdit: Story = {
  args: {
    icon: <UserIcon />,
    title: '管理 太郎',
    status: <StatusPill tone="success" label="有効" />,
    subtitle: 'ID: USR-00000001',
  },
}

export const NewUser: Story = {
  args: {
    icon: <UserIcon />,
    title: '新規ユーザー作成',
    subtitle: '社員情報とロールを設定します',
    gradient: true,
  },
}
