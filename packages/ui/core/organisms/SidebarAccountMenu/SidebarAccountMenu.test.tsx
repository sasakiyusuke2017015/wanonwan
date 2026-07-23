// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SidebarAccountMenu } from './SidebarAccountMenu'

const baseSections = [
  {
    id: 'roles',
    title: '役職を切り替え',
    showCheck: true,
    items: [
      { id: 'role:200', label: '受講者', active: true, disabled: true },
      { id: 'role:900', label: '管理者' },
    ],
  },
  {
    id: 'actions',
    items: [{ id: 'account-info', label: 'あなたの情報' }],
  },
  {
    id: 'logout',
    items: [{ id: 'logout', label: 'ログアウト', destructive: true }],
  },
] as const

function renderMenu(props: Partial<React.ComponentProps<typeof SidebarAccountMenu>> = {}) {
  return render(
    <SidebarAccountMenu
      name="太郎"
      email="taro@example.com"
      departmentName="開発部"
      avatarUrl={null}
      badge={<span data-testid="role-badge">badge:受講者</span>}
      collapsed={false}
      sections={baseSections}
      onAction={() => {}}
      {...props}
    />,
  )
}

describe('SidebarAccountMenu — trigger', () => {
  it('展開時は badge + 名前 + 部署が出る', () => {
    renderMenu()
    expect(screen.getByTestId('role-badge')).toBeInTheDocument()
    expect(screen.getByText('太郎')).toBeInTheDocument()
    expect(screen.getByText('開発部')).toBeInTheDocument()
  })

  it('折りたたみ時は avatar のみ (名前・部署なし) + 汎用 aria-label', () => {
    renderMenu({ collapsed: true })
    expect(screen.queryByText('太郎')).toBeNull()
    expect(screen.queryByText('開発部')).toBeNull()
    expect(screen.getByRole('button', { name: 'アカウントメニューを開く' })).toBeInTheDocument()
  })

  it('avatarUrl 無しはイニシャルを表示する (trigger のみ leading-none)', () => {
    renderMenu()
    const initial = screen.getByText('太')
    expect(initial).toBeInTheDocument()
    expect(initial.className).toContain('leading-none')
  })

  it('popover ヘッダのイニシャルは leading-none を持たない (旧実装の出力と一致)', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    const initials = screen.getAllByText('太')
    expect(initials).toHaveLength(2)
    const headerInitial = initials.find((el) => !el.className.includes('leading-none'))
    expect(headerInitial).toBeDefined()
    expect(headerInitial?.className).toBe('')
  })
})

describe('SidebarAccountMenu — popover', () => {
  it('開くとヘッダ (名前 / メール) と section title が出る', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    expect(screen.getByText('taro@example.com')).toBeInTheDocument()
    expect(screen.getByText('役職を切り替え')).toBeInTheDocument()
    expect(screen.getByText('あなたの情報')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('section error が role=alert で出る', async () => {
    const user = userEvent.setup()
    renderMenu({
      sections: [
        {
          id: 'roles',
          title: '役職を切り替え',
          items: [{ id: 'role:900', label: '管理者' }],
          error: '切り替えに失敗しました',
        },
      ],
    })
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    expect(screen.getByRole('alert')).toHaveTextContent('切り替えに失敗しました')
  })

  it('active item は選択中スタイル (bg-blue-50)', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    const activeItem = screen.getByText('受講者').closest('button')
    expect(activeItem?.className).toContain('bg-blue-50')
  })
})

describe('SidebarAccountMenu — onAction 契約', () => {
  it('item クリックで onAction(id, ctx) が呼ばれる', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    renderMenu({ onAction })
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    await user.click(screen.getByText('管理者'))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onAction.mock.calls[0][0]).toBe('role:900')
    expect(typeof onAction.mock.calls[0][1].closeMenu).toBe('function')
  })

  it('handler が closeMenu を呼ばなければ menu は開いたまま (失敗時 open 維持)', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    renderMenu({ onAction })
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    await user.click(screen.getByText('管理者'))
    expect(screen.getByText('役職を切り替え')).toBeInTheDocument()
  })

  it('handler が ctx.closeMenu を呼ぶと menu が閉じる (成功時 close)', async () => {
    const onAction = vi.fn((_id: string, ctx: { closeMenu: () => void }) => ctx.closeMenu())
    const user = userEvent.setup()
    renderMenu({ onAction })
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    await user.click(screen.getByText('あなたの情報'))
    expect(screen.queryByText('役職を切り替え')).toBeNull()
  })

  it('disabled item は onAction が呼ばれない (busy 中の二重実行抑止)', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    renderMenu({ onAction })
    await user.click(screen.getByRole('button', { name: '太郎 のアカウントメニュー' }))
    await user.click(screen.getByText('受講者'))
    expect(onAction).not.toHaveBeenCalled()
  })
})

describe('SidebarAccountMenu — placement="topbar"', () => {
  it('trigger は avatar のみで名前・部署を出さない (Sidebar 非表示幅の導線)', () => {
    renderMenu({ placement: 'topbar' })
    expect(screen.queryByText('太郎')).toBeNull()
    expect(screen.queryByText('開発部')).toBeNull()
    expect(screen.getByRole('button', { name: 'アカウントメニューを開く' })).toBeInTheDocument()
  })

  it('popover の中身は sidebar 配置と同じ (sections / showCheck / destructive を共有)', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    renderMenu({ placement: 'topbar', onAction })
    await user.click(screen.getByRole('button', { name: 'アカウントメニューを開く' }))
    expect(screen.getByText('役職を切り替え')).toBeInTheDocument()
    await user.click(screen.getByText('管理者'))
    expect(onAction).toHaveBeenCalledWith('role:900', expect.anything())
  })

  it('sidebar 配置の区切り線ブロックを持たない', () => {
    const { container } = renderMenu({ placement: 'topbar' })
    expect(container.querySelector('.border-sidebar-border')).toBeNull()
  })
})
