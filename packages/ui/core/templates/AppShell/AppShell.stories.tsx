import type { Meta, StoryObj } from '@storybook/react'

import { AppShellProvider, useAppShell } from './AppShellProvider'
import { AppShellRoot } from './AppShellRoot'

const meta: Meta<typeof AppShellProvider> = {
  title: 'テンプレート/AppShell',
  component: AppShellProvider,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof AppShellProvider>

function DemoShell() {
  const { sidebarState, toggleSidebar } = useAppShell()
  return (
    <div className="flex min-h-64">
      {/* sidebar 相当: --sidebar-w が data-sidebar-state で切り替わるのを可視化 */}
      <aside className="w-[var(--sidebar-w)] shrink-0 bg-sidebar p-4 text-sidebar-foreground transition-[width] duration-[var(--shell-transition-duration)] ease-out">
        <span className="text-sm">sidebar ({sidebarState})</span>
      </aside>
      <main className="flex-1 p-6">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
        >
          トグル (Cmd/Ctrl+B でも可)
        </button>
        <p className="mt-4 text-sm text-gray-600">
          AppShellProvider が開閉状態を Context + cookie で持ち、AppShellRoot が
          data-sidebar-state 属性で tokens.css の --sidebar-w 切替に接続する。
        </p>
      </main>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <AppShellProvider initialState="expanded">
      <AppShellRoot>
        <DemoShell />
      </AppShellRoot>
    </AppShellProvider>
  ),
}

export const CollapsedInitial: Story = {
  render: () => (
    <AppShellProvider initialState="collapsed">
      <AppShellRoot>
        <DemoShell />
      </AppShellRoot>
    </AppShellProvider>
  ),
}
