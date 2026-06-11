/**
 * @ui-catalog/core
 *
 * Atomic Design ベースの汎用 UI コンポーネントライブラリ
 *
 * 構造:
 * - atoms/       最小単位（Button, Input, Icon, Badge 等）
 * - molecules/   atoms の組み合わせ（FormField, MenuItem 等）
 * - organisms/   独立したセクション（Dialog, Modal, Card 等）
 * - templates/   ページレイアウト（AppShell, Header 等）
 * - hooks/       カスタムフック
 * - constants/   定数定義
 * - tokens/      デザイントークン
 * - types/       共通型定義
 * - styles/      グローバルスタイル
 * - utils/       ユーティリティ
 */

// Atomic Design layers
export * from './atoms'
export * from './molecules'
export * from './organisms'
export * from './templates'

// Foundation
export * from './tokens'
export * from './constants'
export * from './types'

// Utilities
export * from './hooks'
export * from './utils'
