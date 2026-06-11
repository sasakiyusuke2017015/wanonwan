'use client'

/**
 * React Router 用 RouterAdapter 実装
 */

import React from 'react'
import {
  Link as ReactRouterLink,
  useNavigate as useReactRouterNavigate,
  useLocation,
} from 'react-router-dom'

import type { RouterAdapter, LinkProps, NavigateFunction } from './types'

const Link: React.FC<LinkProps> = ({
  href,
  children,
  className,
  style,
  onClick,
  ...rest
}) => {
  const dataProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('data-'))
  )

  return (
    <ReactRouterLink
      to={href}
      className={className}
      style={style}
      onClick={onClick}
      {...dataProps}
    >
      {children}
    </ReactRouterLink>
  )
}

const useNavigate = (): NavigateFunction => {
  const navigate = useReactRouterNavigate()

  return (path: string, options?: { replace?: boolean }) => {
    navigate(path, { replace: options?.replace })
  }
}

const usePathname = (): string => {
  const location = useLocation()
  return location.pathname
}

export const reactRouterAdapter: RouterAdapter = {
  Link,
  useNavigate,
  usePathname,
}

export default reactRouterAdapter
