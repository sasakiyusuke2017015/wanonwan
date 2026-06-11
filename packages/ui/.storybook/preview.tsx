/**
 * Storybook Preview 設定
 *
 * ui-catalog の Storybook 用プレビュー設定
 */
import type { Preview } from '@storybook/react'

import '../core/styles/globals.css'
import { baseDecorators, baseParameters } from '../infra/storybook'

const preview: Preview = {
  decorators: baseDecorators,
  parameters: baseParameters,
}

export default preview
