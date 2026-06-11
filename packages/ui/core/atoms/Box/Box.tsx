import { FC, ReactNode, CSSProperties, HTMLAttributes } from 'react'

import { cn } from '../../utils/cn'

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** padding */
  p?: number | string
  /** padding-x (horizontal) */
  px?: number | string
  /** padding-y (vertical) */
  py?: number | string
  /** margin */
  m?: number | string
  /** margin-x (horizontal) */
  mx?: number | string
  /** margin-y (vertical) */
  my?: number | string
  /** display */
  display?: 'block' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none'
  /** as element */
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' | 'header' | 'footer'
}

/**
 * Box - 最小のレイアウトプリミティブ
 * padding, margin, display を簡潔に指定可能
 */
export const Box: FC<BoxProps> = ({
  children,
  className,
  style,
  p,
  px,
  py,
  m,
  mx,
  my,
  display,
  as: Tag = 'div',
  ...props
}) => {
  const computedStyle: CSSProperties = {
    ...(p !== undefined && { padding: typeof p === 'number' ? `${p}px` : p }),
    ...(px !== undefined && { paddingLeft: typeof px === 'number' ? `${px}px` : px, paddingRight: typeof px === 'number' ? `${px}px` : px }),
    ...(py !== undefined && { paddingTop: typeof py === 'number' ? `${py}px` : py, paddingBottom: typeof py === 'number' ? `${py}px` : py }),
    ...(m !== undefined && { margin: typeof m === 'number' ? `${m}px` : m }),
    ...(mx !== undefined && { marginLeft: typeof mx === 'number' ? `${mx}px` : mx, marginRight: typeof mx === 'number' ? `${mx}px` : mx }),
    ...(my !== undefined && { marginTop: typeof my === 'number' ? `${my}px` : my, marginBottom: typeof my === 'number' ? `${my}px` : my }),
    ...(display && { display }),
    ...style,
  }

  return (
    <Tag
      className={cn(className)}
      style={computedStyle}
      data-component="box"
      {...props}
    >
      {children}
    </Tag>
  )
}
