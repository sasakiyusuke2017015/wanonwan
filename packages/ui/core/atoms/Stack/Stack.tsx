import { FC, ReactNode, CSSProperties, HTMLAttributes } from 'react'

import { cn } from '../../utils/cn'

export type StackDirection = 'row' | 'column'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** 方向 */
  direction?: StackDirection
  /** gap (数値の場合はpx) */
  gap?: number | string
  /** align-items */
  align?: StackAlign
  /** justify-content */
  justify?: StackJustify
  /** flex-wrap */
  wrap?: boolean
}

const alignClasses: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyClasses: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

/**
 * Stack - Flexboxレイアウトプリミティブ
 * 方向、gap、配置を簡潔に指定可能
 */
export const Stack: FC<StackProps> = ({
  children,
  className,
  style,
  direction = 'column',
  gap,
  align,
  justify,
  wrap,
  ...props
}) => {
  const classes = cn(
    'flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    align && alignClasses[align],
    justify && justifyClasses[justify],
    wrap && 'flex-wrap',
    className,
  )

  const computedStyle: CSSProperties = {
    ...(gap !== undefined && { gap: typeof gap === 'number' ? `${gap}px` : gap }),
    ...style,
  }

  return (
    <div
      className={classes}
      style={computedStyle}
      data-component="stack"
      {...props}
    >
      {children}
    </div>
  )
}
