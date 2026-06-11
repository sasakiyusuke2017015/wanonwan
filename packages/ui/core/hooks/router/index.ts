/**
 * @ui-catalog/core/hooks/router
 *
 * ルーティングの抽象化層
 */

export type {
  RouterAdapter,
  LinkProps,
  NavigateFunction,
} from './types'

export {
  RouterProvider,
  RouterContext,
  useRouterAdapter,
  useNavigate,
  usePathname,
  useLink,
  RouterLink,
} from './RouterContext'

export type { RouterProviderProps } from './RouterContext'

export { reactRouterAdapter } from './react-router'
