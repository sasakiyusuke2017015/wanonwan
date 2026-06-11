import { type ButtonHTMLAttributes, type ReactNode, isValidElement } from 'react'
import { type IconName } from '../../constants'
import { Icon } from '../../atoms/Icon'

interface IconButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** アイコンサイズ（px） */
  size?: number
  /** ツールチップ */
  label?: string
  /** バリアント */
  variant?: 'default' | 'danger' | 'ghost'
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
  ...props
}: IconButtonProps) {
  const variantClasses: Record<string, string> = {
    default: 'hover:text-[var(--color-text)] hover:bg-[var(--color-hover-bg)]',
    danger: 'hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)]',
    ghost: 'hover:bg-primary-50 hover:text-primary-600',
  }

  const variantClass = variantClasses[variant] || variantClasses.default

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      data-component="icon-button"
      className={`inline-flex items-center justify-center p-1 rounded text-[var(--color-text-muted)] transition-colors cursor-pointer ${
        disabled ? 'opacity-30 cursor-default' : variantClass
      } ${className}`}
      {...props}
    >
      {children && isValidElement(children) ? (
        children
      ) : icon ? (
        <Icon name={icon} size={size} />
      ) : null}
    </button>
  )
}
