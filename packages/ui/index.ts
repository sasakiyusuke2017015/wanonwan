/**
 * @ui-catalog/core - UIコンポーネントパッケージ
 *
 * Design System + 育成メカニズム
 *
 * 構造:
 * - core/         純粋UI（atoms, molecules, organisms, templates, tokens, hooks, constants, types, utils, styles）
 * - core/calend/  カレンダーモジュール（atoms, molecules, organisms, hooks, state, types, utils）
 * - infra/        育成・観測（devtools, version, theme, commands, storybook）
 *
 * 推奨インポート:
 * ```typescript
 * import { Button, Input } from '@ui-catalog/core/atoms'
 * import { FormField, Question } from '@ui-catalog/core/molecules'
 * import { Modal, InteractiveTable } from '@ui-catalog/core/organisms'
 * import { WeekView, MonthView } from '@ui-catalog/core/calend'
 * ```
 */

// Core
export * from './core'

// Infra (devtools, version, theme)
export * from './infra'
