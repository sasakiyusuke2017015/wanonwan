/**
 * Storybook Preset 設定
 *
 * ui-catalog の Storybook 共通設定
 */
import type { StorybookConfig } from '@storybook/react-vite'
import type { InlineConfig } from 'vite'

/**
 * 基本の Storybook 設定
 */
export const storybookConfig: Partial<StorybookConfig> = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
  ],
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}

/**
 * Docker 環境用 HMR 設定
 */
export const withDockerHmr = (
  userViteConfig?: InlineConfig,
): ((config: InlineConfig) => InlineConfig) => {
  return (config: InlineConfig) => {
    const mergedConfig: InlineConfig = {
      ...config,
      ...userViteConfig,
      server: {
        ...config.server,
        ...userViteConfig?.server,
        hmr: {
          port: 6007,
          clientPort: 6007,
          host: 'localhost',
        },
        watch: {
          usePolling: true,
          interval: 1000,
        },
      },
    }
    return mergedConfig
  }
}
