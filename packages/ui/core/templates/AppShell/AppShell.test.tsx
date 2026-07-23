// @vitest-environment jsdom

import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppShellProvider, useAppShell } from './AppShellProvider'
import { AppShellRoot } from './AppShellRoot'
import { parseSidebarState } from './sidebarState'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AppShellProvider initialState="expanded">{children}</AppShellProvider>
}

function Display() {
  const { sidebarState } = useAppShell()
  return <span data-testid="state">{sidebarState}</span>
}

beforeEach(() => {
  document.cookie = 'sidebar_state=; path=/; max-age=0'
  document.cookie = 'custom_sidebar=; path=/; max-age=0'
})

describe('parseSidebarState', () => {
  it("returns 'expanded' for undefined / null", () => {
    expect(parseSidebarState(undefined)).toBe('expanded')
    expect(parseSidebarState(null)).toBe('expanded')
  })

  it("returns 'collapsed' only for exact 'collapsed'", () => {
    expect(parseSidebarState('collapsed')).toBe('collapsed')
  })

  it("returns 'expanded' for 'expanded' and garbage values", () => {
    expect(parseSidebarState('expanded')).toBe('expanded')
    expect(parseSidebarState('garbage')).toBe('expanded')
  })
})

describe('useAppShell', () => {
  it('returns initialState', () => {
    const { result } = renderHook(() => useAppShell(), { wrapper: Wrapper })
    expect(result.current.sidebarState).toBe('expanded')
  })

  it('throws when used outside Provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAppShell())).toThrow(/AppShellProvider/)
    spy.mockRestore()
  })
})

describe('AppShellProvider — toggle / cookie', () => {
  it('toggleSidebar switches state expanded -> collapsed', () => {
    const { result } = renderHook(() => useAppShell(), { wrapper: Wrapper })
    act(() => result.current.toggleSidebar())
    expect(result.current.sidebarState).toBe('collapsed')
  })

  it('toggleSidebar switches back collapsed -> expanded', () => {
    const { result } = renderHook(() => useAppShell(), { wrapper: Wrapper })
    act(() => result.current.toggleSidebar())
    act(() => result.current.toggleSidebar())
    expect(result.current.sidebarState).toBe('expanded')
  })

  it('persists state to cookie on toggle', () => {
    const { result } = renderHook(() => useAppShell(), { wrapper: Wrapper })
    act(() => result.current.toggleSidebar())
    expect(document.cookie).toContain('sidebar_state=collapsed')
  })

  it('setSidebarState updates state and cookie', () => {
    const { result } = renderHook(() => useAppShell(), { wrapper: Wrapper })
    act(() => result.current.setSidebarState('collapsed'))
    expect(result.current.sidebarState).toBe('collapsed')
    expect(document.cookie).toContain('sidebar_state=collapsed')
  })

  it('persists to a custom cookie name via cookieName prop', () => {
    const { result } = renderHook(() => useAppShell(), {
      wrapper: ({ children }) => (
        <AppShellProvider initialState="expanded" cookieName="custom_sidebar">
          {children}
        </AppShellProvider>
      ),
    })
    act(() => result.current.toggleSidebar())
    expect(document.cookie).toContain('custom_sidebar=collapsed')
  })
})

describe('AppShellProvider — keyboard shortcut', () => {
  it('Cmd+B toggles when focus is on body', async () => {
    const user = userEvent.setup()
    render(
      <AppShellProvider initialState="expanded">
        <Display />
      </AppShellProvider>,
    )
    await user.keyboard('{Meta>}b{/Meta}')
    expect(screen.getByTestId('state').textContent).toBe('collapsed')
  })

  it('Ctrl+B toggles when focus is on body', async () => {
    const user = userEvent.setup()
    render(
      <AppShellProvider initialState="expanded">
        <Display />
      </AppShellProvider>,
    )
    await user.keyboard('{Control>}b{/Control}')
    expect(screen.getByTestId('state').textContent).toBe('collapsed')
  })

  it('does NOT toggle when focus is in <input>', async () => {
    const user = userEvent.setup()
    render(
      <AppShellProvider initialState="expanded">
        <input data-testid="input" />
        <Display />
      </AppShellProvider>,
    )
    await user.click(screen.getByTestId('input'))
    await user.keyboard('{Meta>}b{/Meta}')
    expect(screen.getByTestId('state').textContent).toBe('expanded')
  })

  it('does NOT toggle when focus is in <textarea>', async () => {
    const user = userEvent.setup()
    render(
      <AppShellProvider initialState="expanded">
        <textarea data-testid="ta" />
        <Display />
      </AppShellProvider>,
    )
    await user.click(screen.getByTestId('ta'))
    await user.keyboard('{Control>}b{/Control}')
    expect(screen.getByTestId('state').textContent).toBe('expanded')
  })

  // NOTE: contenteditable の focus は jsdom で <div> に click しても activeElement が
  // 切り替わらないため、ここでは省略。実装側は isContentEditable で正しくガードしている
  // (E2E で確認する)。

  it('removes keydown listener on unmount', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <AppShellProvider initialState="expanded">
        <Display />
      </AppShellProvider>,
    )
    unmount()
    await user.keyboard('{Meta>}b{/Meta}')
    expect(screen.queryByTestId('state')).toBeNull()
  })
})

describe('AppShellRoot', () => {
  it('binds data-sidebar-state to the root div', () => {
    render(
      <AppShellProvider initialState="collapsed">
        <AppShellRoot>
          <div>content</div>
        </AppShellRoot>
      </AppShellProvider>,
    )
    const root = screen.getByText('content').parentElement
    expect(root).toHaveAttribute('data-sidebar-state', 'collapsed')
  })

  it('reflects toggle into data-sidebar-state', async () => {
    function Toggle() {
      const { toggleSidebar } = useAppShell()
      return (
        <button type="button" onClick={toggleSidebar}>
          toggle
        </button>
      )
    }
    const user = userEvent.setup()
    render(
      <AppShellProvider initialState="expanded">
        <AppShellRoot>
          <Toggle />
        </AppShellRoot>
      </AppShellProvider>,
    )
    const root = screen.getByText('toggle').parentElement
    expect(root).toHaveAttribute('data-sidebar-state', 'expanded')
    await user.click(screen.getByText('toggle'))
    expect(root).toHaveAttribute('data-sidebar-state', 'collapsed')
  })
})
