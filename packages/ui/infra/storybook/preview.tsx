/**
 * Storybook Preview 共通設定
 *
 * デコレーターとパラメーターの共通定義
 */
import type { Preview, Decorator } from '@storybook/react'

import { RouterProvider } from '../../core/hooks/router/RouterContext'
import type { RouterAdapter, LinkProps } from '../../core/hooks/router/types'

const storybookRouterAdapter: RouterAdapter = {
  useNavigate: () => (path: string) => {
    console.log(`[Storybook] navigate to: ${path}`)
  },
  usePathname: () => '/',
  Link: ({ href, children, className, style, onClick, ...props }: LinkProps) => (
    <a href={href} className={className} style={style} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}

/**
 * 基本デコレーター
 * - RouterProvider（Storybook 用モックアダプタ）
 * - パディング追加
 */
export const baseDecorators: Decorator[] = [
  (Story) => (
    <RouterProvider adapter={storybookRouterAdapter}>
      <div className="p-4">
        <Story />
      </div>
    </RouterProvider>
  ),
]

/**
 * 基本パラメーター
 */
export const baseParameters: Preview['parameters'] = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#ffffff' },
      { name: 'dark', value: '#1a1a1a' },
      { name: 'gray', value: '#f4f4f5' },
    ],
  },
}
