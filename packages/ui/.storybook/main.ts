/**
 * Storybook Main 設定
 *
 * ui-catalog の Storybook 設定
 */
import type { StorybookConfig } from '@storybook/react-vite'

import { storybookConfig, withDockerHmr } from '../infra/storybook/preset.ts'

const config: StorybookConfig = {
  ...storybookConfig,
  stories: ['../**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  viteFinal: withDockerHmr(undefined),
}

export default config
