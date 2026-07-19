'use client'

import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  isValidElement,
  useState,
} from 'react'
import { Icon, CLICK_SPIN, type AnyIconName } from '../../atoms/Icon'
import { Tooltip, type TooltipPosition } from '../../atoms/Tooltip'
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
  /** ツールチップ (Tooltip atom) と aria-label に使う名称 */
  label?: string
  /** ツールチップの表示位置。コンテナ右端に置くボタンは 'top-end' で見切れを防ぐ */
  tooltipPosition?: TooltipPosition
  /** バリアント */
  variant?: 'default' | 'danger' | 'ghost' | 'primary'
  /**
   * クリックするたびにアイコンを回転させ、その角度で止める（累積）。
   * 回転角と回転軸はアイコン固有のデフォルト（`CLICK_SPIN`）から引く
   * （gear は Z 軸 90°、columns-3 は Y 軸フリップ 180° 等）。
   * 登録のないアイコンでは無効（回転しない）。
   */
  spinOnClick?: boolean
  /** hover 時に斜めの光沢を一度走らせる */
  shimmer?: boolean
  /**
   * 押し込み (アクティブ) 見た目。開閉トグル等で「今開いている」状態を視覚化する。
   * 見た目のみで aria は付けない — 状態のセマンティクスは呼び出し側が
   * `aria-expanded` / `aria-pressed` で持つ (funnel は aria-expanded 済み)。
   */
  active?: boolean
  /**
   * 渡すと `<button>` ではなく `<a href>` で描画し、Ctrl/⌘/中クリックでの別タブ等の
   * ブラウザネイティブ動作を有効化する。通常クリックは preventDefault して `onClick`
   * (= 呼び出し側の SPA 遷移) を呼ぶ。`disabled` とは併用しない (リンクに disabled は無いため)。
   */
  href?: string
}

interface IconButtonWithName extends IconButtonBaseProps {
  /** アイコン名（独自 SVG + lucide registry の両方を受ける） */
  icon: AnyIconName
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
  tooltipPosition = 'top',
  variant = 'default',
  className = '',
  disabled,
  children,
  spinOnClick = false,
  shimmer = false,
  active = false,
  href,
  onClick,
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

  const spin = icon ? CLICK_SPIN[icon] : undefined
  const spinEnabled = spinOnClick && spin != null
  const [turns, setTurns] = useState(0)

  const handleClick = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (spinEnabled) setTurns((t) => t + 1)
    onClick?.(event)
  }

  // Y 軸は 3D フリップ。perspective が無いと単なる横つぶれに見えるため付ける
  const iconStyle = spinEnabled
    ? {
        transform:
          spin?.axis === 'y'
            ? `perspective(200px) rotateY(${turns * spin.deg}deg)`
            : `rotate(${turns * (spin?.deg ?? 0)}deg)`,
        transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    : undefined

  const isActive = active && !disabled

  const sharedClassName = `inline-flex items-center justify-center p-1 rounded transition-colors cursor-pointer ${
    disabled ? 'text-[var(--color-text-muted)] opacity-30 cursor-default' : variantClass
  } ${shimmer ? styles.shimmer : ''} ${isActive ? styles.active : ''} ${className}`

  const content =
    children && isValidElement(children) ? (
      children
    ) : icon ? (
      <Icon name={icon} size={size} style={iconStyle} />
    ) : null

  // ツールチップは native title でなく Tooltip atom で出す (見た目統一 +
  // キーボードフォーカスでも表示される)。label が無ければ素のまま返す。
  const withTooltip = (element: ReactElement) =>
    label ? (
      <Tooltip content={label} position={tooltipPosition}>
        {element}
      </Tooltip>
    ) : (
      element
    )

  // href を渡したときは <a> で描画し、Ctrl/⌘/中クリックの別タブ等をブラウザに委ねる。
  // 通常クリックのみ preventDefault して onClick (= 呼び出し側の SPA 遷移) を呼ぶ。
  if (href && !disabled) {
    return withTooltip(
      <a
        href={href}
        aria-label={label}
        data-component="icon-button"
        data-active={isActive ? '' : undefined}
        onClick={(e) => {
          if (isModifiedClick(e)) return // 別タブ等はブラウザに委ねる
          e.preventDefault()
          handleClick(e)
        }}
        className={sharedClassName}
      >
        {content}
      </a>,
    )
  }

  return withTooltip(
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-component="icon-button"
      data-active={isActive ? '' : undefined}
      onClick={handleClick}
      className={sharedClassName}
      {...props}
    >
      {content}
    </button>,
  )
}
