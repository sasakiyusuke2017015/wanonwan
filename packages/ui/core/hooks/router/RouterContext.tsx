'use client'

/**
 * RouterContext - RouterAdapter を注入するための Context
 *
 * アプリケーション側で RouterProvider を使用してアダプタを注入する
 */

import React, { createContext, useContext, type ReactNode } from 'react'

import type { RouterAdapter, NavigateFunction, LinkProps } from './types'

const RouterContext = createContext<RouterAdapter | null>(null)

interface RouterProviderProps {
  adapter: RouterAdapter
  children: ReactNode
}

export const RouterProvider: React.FC<RouterProviderProps> = ({
  adapter,
  children,
}) => {
  return (
    <RouterContext.Provider value={adapter}>{children}</RouterContext.Provider>
  )
}

export const useRouterAdapter = (): RouterAdapter => {
  const adapter = useContext(RouterContext)
  if (!adapter) {
    throw new Error(
      'useRouterAdapter must be used within a RouterProvider. ' +
        'Wrap your app with <RouterProvider adapter={...}>.'
    )
  }
  return adapter
}

export const useNavigate = (): NavigateFunction => {
  const adapter = useRouterAdapter()
  return adapter.useNavigate()
}

export const usePathname = (): string => {
  const adapter = useRouterAdapter()
  return adapter.usePathname()
}

export const useLink = (): React.ComponentType<LinkProps> => {
  const adapter = useRouterAdapter()
  return adapter.Link
}

export const RouterLink: React.FC<LinkProps> = (props) => {
  const Link = useLink()
  return <Link {...props} />
}

export { RouterContext }
export type { RouterProviderProps }
