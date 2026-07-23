// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SidebarShell } from './SidebarShell'

const groups = [
  {
    id: 'main',
    label: 'メイン',
    items: [
      { href: '/dashboard', label: 'ダッシュボード', icon: 'home' },
      { href: '/courses', label: 'コース', icon: 'book' },
    ],
  },
] as const

function renderShell(props: Partial<React.ComponentProps<typeof SidebarShell>> = {}) {
  return render(
    <SidebarShell
      groups={groups}
      activeHref="/dashboard"
      collapsed={false}
      onToggle={() => {}}
      resolveIcon={(key) => <span data-testid={`icon-${key}`} />}
      {...props}
    />,
  )
}

describe('SidebarShell — 基本構造', () => {
  it('aside が id / aria-label を持つ', () => {
    renderShell()
    const aside = screen.getByRole('complementary', { name: 'メインナビゲーション' })
    expect(aside).toHaveAttribute('id', 'app-sidebar')
  })

  it('nav groups と items が描画される', () => {
    renderShell()
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
    expect(screen.getByText('コース')).toBeInTheDocument()
    expect(screen.getByTestId('icon-home')).toBeInTheDocument()
  })

  it('footer slot が描画される', () => {
    renderShell({ footer: <div data-testid="footer-slot">user menu</div> })
    expect(screen.getByTestId('footer-slot')).toBeInTheDocument()
  })
})

describe('SidebarShell — brand', () => {
  it('展開時は brand label とリンクが出る', () => {
    renderShell({
      brand: { href: '/dashboard', icon: <span data-testid="brand-icon" />, label: 'AI Certification' },
    })
    const link = screen.getByRole('link', { name: /AI Certification/ })
    expect(link).toHaveAttribute('href', '/dashboard')
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument()
  })

  it('折りたたみ時は brand が出ない', () => {
    renderShell({
      collapsed: true,
      brand: { href: '/dashboard', icon: <span data-testid="brand-icon" />, label: 'AI Certification' },
    })
    expect(screen.queryByText('AI Certification')).toBeNull()
  })
})

describe('SidebarShell — 開閉トグル', () => {
  it('展開時: aria-label=折りたたむ / aria-expanded=true', () => {
    renderShell()
    const btn = screen.getByRole('button', { name: 'サイドバーを折りたたむ' })
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(btn).toHaveAttribute('aria-controls', 'app-sidebar')
  })

  it('折りたたみ時: aria-label=開く / aria-expanded=false', () => {
    renderShell({ collapsed: true })
    const btn = screen.getByRole('button', { name: 'サイドバーを開く' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('クリックで onToggle が呼ばれる', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    renderShell({ onToggle })
    await user.click(screen.getByRole('button', { name: 'サイドバーを折りたたむ' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
