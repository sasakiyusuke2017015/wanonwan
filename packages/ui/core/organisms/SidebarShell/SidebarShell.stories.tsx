import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { Icon, type AnyIconName } from '../../atoms/Icon'

import { SidebarShell } from './SidebarShell'

const meta: Meta<typeof SidebarShell> = {
  title: 'オーガニズム/SidebarShell',
  component: SidebarShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof SidebarShell>

const groups = [
  {
    id: 'main',
    items: [
      { href: '/dashboard', label: 'ダッシュボード', icon: 'dashboard' },
      { href: '/courses', label: 'マイコース', icon: 'book-open' },
      { href: '/exams', label: '認定試験', icon: 'clipboard-check' },
    ],
  },
  {
    id: 'account',
    label: 'アカウント',
    items: [
      { href: '/certifications/me', label: '認定情報', icon: 'award' },
      { href: '/settings', label: 'あなたの情報', icon: 'user-round', comingSoon: true },
    ],
  },
] as const

function resolveIcon(key: string) {
  return <Icon name={key as AnyIconName} size={20} className="shrink-0" />
}

function InteractiveShell({ initialCollapsed = false }: { initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  return (
    <div data-sidebar-state={collapsed ? 'collapsed' : 'expanded'} className="min-h-screen">
      <SidebarShell
        groups={groups}
        activeHref="/courses"
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        resolveIcon={resolveIcon}
        brand={{
          href: '/dashboard',
          icon: <Icon name="graduation-cap" size={20} strokeWidth={2} />,
          label: 'AI Certification',
        }}
        footer={
          <div className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/60">
            footer slot
          </div>
        }
      />
      {/* .transition-sidebar は app 側 utility のため story では transition なしの配置のみ */}
      <main className="pl-[var(--sidebar-w)] p-6">
        <p className="text-sm text-gray-600">
          トグルで開閉。幅は tokens.css の --sidebar-w (data-sidebar-state) が制御する。
        </p>
      </main>
    </div>
  )
}

export const Default: Story = {
  render: () => <InteractiveShell />,
}

export const Collapsed: Story = {
  render: () => <InteractiveShell initialCollapsed />,
}
