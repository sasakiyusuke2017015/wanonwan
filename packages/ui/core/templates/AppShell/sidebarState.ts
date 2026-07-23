export type SidebarState = 'expanded' | 'collapsed'

/** Sidebar 開閉状態を永続化する cookie の既定名 (AppShellProvider の default) */
export const SIDEBAR_STATE_COOKIE = 'sidebar_state'

/**
 * cookie 等から読んだ生値を SidebarState に正規化する。
 * 不正値・未設定は 'expanded' に fallback。
 * SSR 側 (Next の cookies() 等) はこの関数に生値を渡すだけでよい。
 */
export function parseSidebarState(value: string | null | undefined): SidebarState {
  return value === 'collapsed' ? 'collapsed' : 'expanded'
}
