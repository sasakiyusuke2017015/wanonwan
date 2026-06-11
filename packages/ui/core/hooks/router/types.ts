/**
 * RouterAdapter - ルーティングライブラリの抽象化層
 *
 * React Router と Next.js の差分を吸収するためのインターフェース
 */

import type { ComponentType, ReactNode, MouseEvent } from 'react'

export interface LinkProps {
  href: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  [key: `data-${string}`]: string | undefined
}

export type NavigateFunction = (
  path: string,
  options?: { replace?: boolean }
) => void

export interface RouterAdapter {
  Link: ComponentType<LinkProps>
  useNavigate: () => NavigateFunction
  usePathname: () => string
  useSearchParams?: () => URLSearchParams
}

/**
 * AuthAdapter - 認証の抽象化層（ジェネリック）
 */
export interface LoginResult<TUser = unknown> {
  success: boolean
  error?: string
  user?: TUser
  requirePasswordChange?: boolean
}

export interface ChangePasswordResult {
  success: boolean
  error?: string
}

export interface AuthAdapter<TUser = unknown> {
  isAuthenticated: boolean
  loading: boolean
  user: TUser | null
  token?: string | null
  login: (username: string, password: string) => Promise<LoginResult<TUser>>
  logout: () => Promise<void>
  getAuthHeaders: () => Record<string, string>
  changePassword?: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<ChangePasswordResult>
}
