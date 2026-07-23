'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { SIDEBAR_STATE_COOKIE, type SidebarState } from './sidebarState'

interface AppShellContextValue {
  sidebarState: SidebarState
  toggleSidebar: () => void
  setSidebarState: (s: SidebarState) => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function persistSidebarState(cookieName: string, s: SidebarState): void {
  if (typeof document === 'undefined') return
  // dev の localhost は http のため、secure を無条件に付けると cookie が書けなくなる。
  const secure = window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${cookieName}=${s}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`
}

// input / textarea / contenteditable focus 中は Cmd+B を無視する。
// フォーム操作のテキスト編集を奪わないため。
function shouldIgnoreKeydown(e: KeyboardEvent): boolean {
  const t = e.target
  if (!(t instanceof HTMLElement)) return false
  const tag = t.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (t.isContentEditable) return true
  return false
}

export function AppShellProvider({
  initialState,
  cookieName = SIDEBAR_STATE_COOKIE,
  children,
}: {
  initialState: SidebarState
  /** 開閉状態を永続化する cookie 名 (default: 'sidebar_state') */
  cookieName?: string
  children: React.ReactNode
}) {
  const [sidebarState, setSidebarStateRaw] = useState<SidebarState>(initialState)

  const setSidebarState = useCallback(
    (s: SidebarState) => {
      setSidebarStateRaw(s)
      persistSidebarState(cookieName, s)
    },
    [cookieName],
  )

  const toggleSidebar = useCallback(() => {
    setSidebarStateRaw((prev) => {
      const next: SidebarState = prev === 'expanded' ? 'collapsed' : 'expanded'
      persistSidebarState(cookieName, next)
      return next
    })
  }, [cookieName])

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (shouldIgnoreKeydown(e)) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [toggleSidebar])

  return (
    <AppShellContext.Provider value={{ sidebarState, toggleSidebar, setSidebarState }}>
      {children}
    </AppShellContext.Provider>
  )
}

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('useAppShell must be used within AppShellProvider')
  return ctx
}
