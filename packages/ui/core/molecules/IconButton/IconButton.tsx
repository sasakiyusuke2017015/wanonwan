'use client'

import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  isValidElement,
} from 'react'
import { type IconName } from '../../constants'
import { Icon } from '../../atoms/Icon'
import { isModifiedClick } from '../../utils'

import styles from './IconButton.module.scss'

interface IconButtonBaseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> {
  /**
   * クリックハンドラ。`href` 指定時は `<a>`、未指定時は `<button>` で描画するため、
   * どちらの要素のイベントも受けられるよう両方を許容する。
   */
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  /** アイコンサイズ（px） */
  size?: number
  /** ツールチップ */
  label?: string
  /** バリアント */
  variant?: 'default' | 'danger' | 'ghost' | 'primary'
  /** hover 時に斜めの光沢を一度走らせる */
  shimmer?: boolean
  /**
   * 渡すと `<button>` ではなく `<a href>` で描画し、Ctrl/⌘/中クリックでの別タブ等の
   * ブラウザネイティブ動作を有効化する。通常クリックは preventDefault して `onClick`
   * (= 呼び出し側の SPA 遷移) を呼ぶ。`disabled` とは併用しない (リンクに disabled は無いため)。
   */
  href?: string
}

interface IconButtonWithName extends IconButtonBaseProps {
  /** アイコン名（ui-catalogのIcon用） */
  icon: IconName
  /** カスタムアイコン（Lucide等の外部アイコン用） */
  children?: never
}

interface IconButtonWithChildren extends IconButtonBaseProps {
  /** アイコン名（ui-catalogのIcon用） */
  icon?: never
  /** カスタムアイコン（Lucide等の外部アイコン用） */
  children: ReactNode
}

export type IconButtonProps = IconButtonWithName | IconButtonWithChildren

export function IconButton({
  icon,
  size = 14,
  label,
  variant = 'default',
  className = '',
  disabled,
  children,
  shimmer = false,
  href,
  onClick,
  // 既定はネイティブ title = label。Tooltip 等でラップするときは title="" で二重表示を抑止する。
  title,
  ...props
}: IconButtonProps) {
  // text 色は variant ごとに持たせる (base には置かない)。base に text-muted を固定すると
  // primary の白文字と衝突して描画順依存になるため、disabled 以外は variant が色を決める。
  const variantClasses: Record<string, string> = {
    default:
      'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover-bg)]',
    danger:
      'text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)]',
    ghost: 'text-[var(--color-text-muted)] hover:bg-primary-50 hover:text-primary-600',
    primary: 'text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]',
  }

  const variantClass = variantClasses[variant] || variantClasses.default

  const sharedClassName = `inline-flex items-center justify-center p-1 rounded transition-colors cursor-pointer ${
    disabled ? 'text-[var(--color-text-muted)] opacity-30 cursor-default' : variantClass
  } ${shimmer ? styles.shimmer : ''} ${className}`

  const content =
    children && isValidElement(children) ? (
      children
    ) : icon ? (
      <Icon name={icon} size={size} />
    ) : null

  // href を渡したときは <a> で描画し、Ctrl/⌘/中クリックの別タブ等をブラウザに委ねる。
  // 通常クリックのみ preventDefault して onClick (= 呼び出し側の SPA 遷移) を呼ぶ。
  if (href && !disabled) {
    return (
      <a
        href={href}
        title={title ?? label}
        aria-label={label}
        data-component="icon-button"
        onClick={(e) => {
          if (isModifiedClick(e)) return // 別タブ等はブラウザに委ねる
          e.preventDefault()
          onClick?.(e)
        }}
        className={sharedClassName}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      disabled={disabled}
      data-component="icon-button"
      onClick={onClick}
      className={sharedClassName}
      {...props}
    >
      {content}
    </button>
  )
}
