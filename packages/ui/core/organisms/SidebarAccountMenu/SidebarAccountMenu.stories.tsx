import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { Badge } from '../../atoms/Badge'
import { Icon } from '../../atoms/Icon'

import { SidebarAccountMenu } from './SidebarAccountMenu'

const meta: Meta<typeof SidebarAccountMenu> = {
  title: 'オーガニズム/SidebarAccountMenu',
  component: SidebarAccountMenu,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof SidebarAccountMenu>

function DemoMenu({ collapsed = false, withError = false }: { collapsed?: boolean; withError?: boolean }) {
  const [activeRole, setActiveRole] = useState('role:200')
  const roleLabel = activeRole === 'role:200' ? '受講者' : '管理者'

  return (
    <div
      data-sidebar-state={collapsed ? 'collapsed' : 'expanded'}
      className="flex min-h-screen items-end"
    >
      <div className="w-[var(--sidebar-w)] bg-sidebar text-sidebar-foreground">
        <SidebarAccountMenu
          name="佐藤 太郎"
          email="taro.sato@example.com"
          departmentName="開発部"
          avatarUrl={null}
          badge={<Badge color="blue" size="small">{roleLabel}</Badge>}
          collapsed={collapsed}
          sections={[
            {
              id: 'roles',
              title: '役職を切り替え',
              showCheck: true,
              error: withError ? '役職の切り替えに失敗しました。再度お試しください。' : null,
              items: [
                { id: 'role:200', label: '受講者', active: activeRole === 'role:200', disabled: activeRole === 'role:200' },
                { id: 'role:900', label: '管理者', active: activeRole === 'role:900', disabled: activeRole === 'role:900' },
              ],
            },
            {
              id: 'actions',
              items: [
                {
                  id: 'account-info',
                  label: 'あなたの情報',
                  icon: <Icon name="user-round" size={16} strokeWidth={1.8} />,
                },
              ],
            },
            {
              id: 'logout',
              items: [
                {
                  id: 'logout',
                  label: 'ログアウト',
                  destructive: true,
                  icon: <Icon name="log-out" size={16} strokeWidth={1.8} />,
                },
              ],
            },
          ]}
          onAction={(id, ctx) => {
            if (id.startsWith('role:')) {
              setActiveRole(id)
              ctx.closeMenu()
              return
            }
            ctx.closeMenu()
          }}
        />
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <DemoMenu />,
}

export const Collapsed: Story = {
  render: () => <DemoMenu collapsed />,
}

export const WithError: Story = {
  render: () => <DemoMenu withError />,
}

/**
 * Sidebar を出さない画面幅 (モバイル等) の導線。avatar のみの compact trigger で、
 * popover は下方向に開く。中身は sidebar 配置と共通。
 */
export const TopbarPlacement: Story = {
  render: function TopbarDemo() {
    const [activeRole, setActiveRole] = useState('role:200')
    const roleLabel = activeRole === 'role:200' ? '受講者' : '管理者'
    return (
      <div className="min-h-screen">
        <header className="flex h-14 items-center justify-end bg-slate-800 px-3 text-white">
          <SidebarAccountMenu
            placement="topbar"
            name="佐藤 太郎"
            email="taro.sato@example.com"
            avatarUrl={null}
            badge={<Badge color="blue" size="small">{roleLabel}</Badge>}
            sections={[
              {
                id: 'roles',
                title: '役職を切り替え',
                showCheck: true,
                items: [
                  { id: 'role:200', label: '受講者', active: activeRole === 'role:200' },
                  { id: 'role:900', label: '管理者', active: activeRole === 'role:900' },
                ],
              },
              { id: 'logout', items: [{ id: 'logout', label: 'ログアウト', destructive: true }] },
            ]}
            onAction={(id, ctx) => {
              if (id.startsWith('role:')) setActiveRole(id)
              ctx.closeMenu()
            }}
          />
        </header>
      </div>
    )
  },
}
