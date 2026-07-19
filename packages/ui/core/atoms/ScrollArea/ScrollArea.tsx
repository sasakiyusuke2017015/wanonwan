'use client'

import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '../../utils/cn'

import styles from './ScrollArea.module.scss'

export type ScrollAreaAxis = 'vertical' | 'horizontal' | 'both'

/** スクロールバーの見た目。'auto'=OS 既定 / 'thin'=細いテーマ追従バー (currentColor 由来) */
export type ScrollAreaScrollbar = 'auto' | 'thin'

export interface ScrollAreaProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  /** スクロール方向 (default: 'vertical') */
  axis?: ScrollAreaAxis
  /**
   * flex 親 (flex-col / flex-row) の中で残り領域を埋め、その中だけを内部スクロールさせる
   * (default: true)。左ペイン (Sidebar) のナビと同じ「ヘッダ/フッタは固定・中央だけスクロール」
   * を作るためのモード。`flex-1` で残り領域を取り、`min-h-0 / min-w-0` で flex 子の
   * はみ出しを許して実際にスクロールさせる。
   *
   * false のときは fill 用クラスを付けず、親が与えた高さ/幅 (例: `h-64`) の中でスクロールする。
   */
  fill?: boolean
  /**
   * スクロールバーの見た目 (default: 'auto')。'thin' は currentColor を薄めた細いバーで、
   * ダーク (Sidebar) でもライトでも背景に馴染む。OS 既定バーがテーマから浮くのを避けたいときに使う。
   */
  scrollbar?: ScrollAreaScrollbar
  /** 描画する要素 (default: 'div')。Sidebar のように nav ランドマークが要るときに指定する */
  as?: ElementType
  className?: string
}

// axis ごとのはみ出し方向。スクロールさせない軸は hidden で固定し、誤った軸の
// スクロールバーが出ないようにする。
const AXIS_CLASS: Record<ScrollAreaAxis, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
}

/**
 * ScrollArea — 内部スクロールするペインのレイアウトプリミティブ。
 *
 * 「外枠は固定して中央の領域だけスクロールさせたい」用途を 1 つの atom に集約する
 * (左ペイン Sidebar のナビ、ダイアログ本文、固定ヘッダ付きパネル等)。各所で
 * `flex-1 min-h-0 overflow-y-auto` を手書きするのをやめ、ここに寄せる。
 */
export const ScrollArea = forwardRef<HTMLElement, ScrollAreaProps>(function ScrollArea(
  { children, axis = 'vertical', fill = true, scrollbar = 'auto', as: Tag = 'div', className, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref}
      data-component="scroll-area"
      data-scrollbar={scrollbar}
      className={cn(
        AXIS_CLASS[axis],
        fill && 'min-h-0 min-w-0 flex-1',
        scrollbar === 'thin' && styles.thin,
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
})
