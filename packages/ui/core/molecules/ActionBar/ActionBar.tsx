'use client'

import type { ReactNode } from 'react'

import { Icon, type AnyIconName } from '../../atoms/Icon'

export type ActionBarItemVariant = 'default' | 'primary'
export type ActionBarItemSize = 'sm' | 'md'
export type ActionBarIconPosition = 'left' | 'right'
export type ActionBarJustify = 'start' | 'center' | 'end'

// variant × size のスタイルマトリクス。共通のレイアウト/ボーダー半径と
// hover/disabled の振る舞いはここに集約する。
const BASE_CLASS = 'inline-flex items-center rounded-md font-medium transition-colors'
const DISABLED_CLASS = 'disabled:cursor-not-allowed disabled:opacity-50'

const SIZE_CLASS: Record<ActionBarItemSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'gap-2 px-4 py-2 text-sm leading-none',
}

const VARIANT_CLASS: Record<ActionBarItemVariant, string> = {
  default: 'border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground',
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
}

const JUSTIFY_CLASS: Record<ActionBarJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
}

const ICON_SIZE: Record<ActionBarItemSize, 'xs' | number> = {
  sm: 'xs',
  md: 16,
}

export interface ActionBarItem {
  /** 表示ラベル。`loading` 中は `loadingLabel` に差し替わる。 */
  label: string
  /** ラベルに添えるアイコン。 */
  icon?: AnyIconName
  /** アイコンの位置 (既定 `left`)。 */
  iconPosition?: ActionBarIconPosition
  /**
   * GET ナビゲーション先。指定すると `<a href>` を描画する。
   * `disabled` が真のときは `<button disabled>` に切り替え、フォーカス→Enter
   * 経由の遷移も封じる (aria-disabled だと遷移できてしまうため)。
   */
  href?: string
  /**
   * `<a download>` を付けるか (ファイルダウンロード用リンク)。`true` で属性のみ、
   * 文字列で suggested filename。ダウンロードは pathname を変えないため、これを
   * 付けないと NavigationProgress のトップバーが焼き付く (nav-anchor-eligibility 参照)。
   */
  download?: boolean | string
  /** ボタン押下時 / リンククリック時のハンドラ。 */
  onClick?: () => void
  /** 見た目のバリアント (既定 `default` = outline)。 */
  variant?: ActionBarItemVariant
  /** サイズ (既定 `sm`)。 */
  size?: ActionBarItemSize
  /** このアクションのみ無効化する。 */
  disabled?: boolean
  /** ローディング状態。`label` を `loadingLabel` に差し替え、無効化する。 */
  loading?: boolean
  /** `loading` 中に表示するラベル (省略時は `label`)。 */
  loadingLabel?: string
}

export interface ActionBarProps {
  /** 横並びに描画するアクション群 (リンク or ボタン)。 */
  actions: ActionBarItem[]
  /** 全アクションを無効化する。href アクションも `<button disabled>` 化する。 */
  disabled?: boolean
  /** 横方向の寄せ (既定 `start`)。 */
  justify?: ActionBarJustify
  /** 行の先頭に差し込むスロット (フィルタ・セレクト等)。 */
  leading?: ReactNode
  /** 末尾に差し込むスロット (「新規作成」ボタン・hidden file input 等)。 */
  children?: ReactNode
}

function itemClassName(variant: ActionBarItemVariant, size: ActionBarItemSize, asButton: boolean) {
  return [
    BASE_CLASS,
    SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    asButton ? DISABLED_CLASS : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * リンク / ボタンのアクションを横並びにする presentational なツールバー。
 *
 * fetch / router 状態は持たず、各アクションの挙動は props で注入する。
 * `href` を持つアクションは `<a>`、持たないものは `<button>` を描画する。
 * `disabled` (バー全体 or 各アクション) が真のとき、href アクションも
 * `<button disabled>` として描画し、キーボード経由の到達を確実に封じる。
 */
export function ActionBar({
  actions,
  disabled = false,
  justify = 'start',
  leading,
  children,
}: ActionBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${JUSTIFY_CLASS[justify]}`}>
      {leading}

      {actions.map((action, i) => {
        const variant = action.variant ?? 'default'
        const size = action.size ?? 'sm'
        const iconPosition = action.iconPosition ?? 'left'
        const isDisabled = disabled || action.disabled || action.loading
        const label = action.loading ? action.loadingLabel ?? action.label : action.label
        const icon = action.icon && (
          <Icon name={action.icon} size={ICON_SIZE[size]} className="shrink-0" aria-hidden />
        )
        const content = (
          <>
            {iconPosition === 'left' && icon}
            {label}
            {iconPosition === 'right' && icon}
          </>
        )

        // href ありかつ未無効化のときだけリンク。無効時は遷移封じのため button 化。
        if (action.href !== undefined && !isDisabled) {
          return (
            <a
              key={i}
              href={action.href}
              download={action.download}
              className={itemClassName(variant, size, false)}
              onClick={action.onClick}
            >
              {content}
            </a>
          )
        }

        return (
          <button
            key={i}
            type="button"
            className={itemClassName(variant, size, true)}
            disabled={isDisabled}
            onClick={action.onClick}
          >
            {content}
          </button>
        )
      })}

      {children}
    </div>
  )
}

export default ActionBar
