'use client'

import { FC, ReactNode, ButtonHTMLAttributes, useState } from 'react'

import { useOperationLog } from '../../../infra/devtools'
import { Icon, type AnyIconName } from '../../atoms/Icon'
import { ShimmerOverlay } from '../../atoms/ShimmerOverlay'
import { Spinner } from '../../atoms/Spinner'

import styles from './Button.module.scss'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'default'
  | 'success'
  | 'nav'
  | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  /** ローディング状態（スピナー表示。children を Spinner に差し替える） */
  loading?: boolean
  /**
   * 遷移待ち状態。children はそのまま残しつつ、上に反復 shimmer を重ねる。
   * `loading`(Spinner 置換) とは別物で、`disabled` にはしない（遷移はブラウザ/
   * router に任せる）。別ページに遷移する CTA のクリック→遷移完了フィードバック用。
   */
  navPending?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
  leftIcon?: AnyIconName
  rightIcon?: AnyIconName
  iconSize?: number
  enableHopEffect?: boolean
  /**
   * leftIcon / rightIcon を hover ではなくクリック時に 1 回だけ pop させる。
   * 既定 (false) は従来どおり hover で pop。
   */
  popIconOnClick?: boolean
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string
  /** 選択状態（nav variant 用） */
  selected?: boolean
  /** フルワイド表示 */
  fullWidth?: boolean
  /** 左ボーダーのアクセントカラー（nav variant 用） */
  accentColor?: 'blue' | 'yellow' | 'orange' | 'green' | 'gray' | 'purple'
}

export const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  navPending = false,
  onClick,
  children,
  className = '',
  leftIcon,
  rightIcon,
  iconSize,
  enableHopEffect = false,
  popIconOnClick = false,
  borderRadius = '0.375rem',
  selected = false,
  fullWidth = false,
  accentColor,
  type,
  ...props
}) => {
  const isDisabled = disabled || loading
  const [isHovered, setIsHovered] = useState(false)
  const [popKey, setPopKey] = useState(0)
  const bumpPop = popIconOnClick ? () => setPopKey((k) => k + 1) : undefined
  const log = useOperationLog('Button')

  // バリアント別の内側陰影色
  const hoverShadowColors: Record<ButtonVariant, string> = {
    primary: 'inset 0 0 0 3px rgba(59, 130, 246, 0.4)',
    secondary: 'inset 0 0 0 3px rgba(107, 114, 128, 0.4)',
    outline: 'inset 0 0 0 3px rgba(59, 130, 246, 0.4)',
    danger: 'inset 0 0 0 3px rgba(239, 68, 68, 0.4)',
    default: 'inset 0 0 0 3px rgba(156, 163, 175, 0.4)',
    success: 'inset 0 0 0 3px rgba(34, 197, 94, 0.4)',
    nav: 'none',
    ghost: 'none',
  }

  // アイコンサイズを決定
  const getIconSize = () => {
    if (iconSize) return iconSize
    switch (size) {
      case 'small':
        return 14
      case 'medium':
        return 16
      case 'large':
        return 18
      default:
        return 16
    }
  }

  // クラス名を構築
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    // fillSweep (hover の方向塗り) は nav / ghost 以外の全 variant に既定で付与。
    variant !== 'nav' && variant !== 'ghost' && styles.fillSweep,
    enableHopEffect && styles.hopEffect,
    isDisabled && styles.disabled,
    selected && styles.selected,
    fullWidth && styles.fullWidth,
    accentColor && styles[`accent-${accentColor}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // カスタムスタイル
  const customStyle: React.CSSProperties = {
    ...(!isDisabled && isHovered ? { boxShadow: hoverShadowColors[variant] } : {}),
    borderRadius,
  }

  // ローディングスピナー
  const LoadingSpinner = () => (
    <Spinner size="sm" variant="default" className={styles.spinner} />
  )

  const buttonElement = (
    <button
      type={type ?? 'button'}
      className={buttonClasses}
      disabled={isDisabled}
      style={customStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={enableHopEffect ? undefined : isDisabled ? undefined : () => {
        bumpPop?.()
        log('click', { variant, size, disabled, loading })
        onClick?.()
      }}
      data-component="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-nav-pending={navPending || undefined}
      {...props}
    >
      <span className={styles.content}>
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && (
          <Icon
            key={popIconOnClick ? `l-${popKey}` : undefined}
            name={leftIcon}
            size={getIconSize()}
            className={styles.icon}
            hover={popIconOnClick ? undefined : 'pop'}
            animation={popIconOnClick && popKey > 0 ? 'pop' : undefined}
          />
        )}
        {children}
        {!loading && rightIcon && (
          <Icon
            key={popIconOnClick ? `r-${popKey}` : undefined}
            name={rightIcon}
            size={getIconSize()}
            className={styles.icon}
            hover={popIconOnClick ? undefined : 'pop'}
            animation={popIconOnClick && popKey > 0 ? 'pop' : undefined}
          />
        )}
      </span>
      <ShimmerOverlay active={navPending} />
    </button>
  )

  // ホップ効果有効時はラッパーで囲んでクリック領域を確保
  if (enableHopEffect) {
    return (
      <div
        className={styles.hopWrapper}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={isDisabled ? undefined : () => {
          bumpPop?.()
          log('click', { variant, size, disabled, loading, hopEffect: true })
          onClick?.()
        }}
        onKeyDown={(e) => {
          if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            bumpPop?.()
            onClick?.()
          }
        }}
      >
        <div className={styles.hopShadow} style={{ borderRadius }} />
        {buttonElement}
      </div>
    )
  }

  return buttonElement
}
