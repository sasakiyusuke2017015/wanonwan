import type { FC } from 'react'

import styles from './ShimmerOverlay.module.scss'

export interface ShimmerOverlayProps {
  /** true の間だけスイープを重ねる。false なら何も描画しない。 */
  active: boolean
  className?: string
}

/**
 * ShimmerOverlay — 親要素いっぱいに重ねる反復スイープの半透明ハイライト。
 *
 * ローディング/遷移待ちの「動いている」フィードバックを、任意のボタン・リンク上に
 * 重ねるための装飾パーツ。親は `position: relative` + `overflow: hidden`
 * (角丸は `border-radius: inherit` で追従) であることを前提にする。
 *
 * - 装飾なので `aria-hidden`。支援技術には出さない (意味は親側の文言/状態が担う)。
 * - `prefers-reduced-motion: reduce` 時はアニメーションを止め、静的な淡い面に
 *   フォールバックする (SCSS 側で分岐)。
 */
export const ShimmerOverlay: FC<ShimmerOverlayProps> = ({
  active,
  className,
}) => {
  if (!active) return null

  return (
    <span
      className={[styles.overlay, className].filter(Boolean).join(' ')}
      data-component="shimmer-overlay"
      aria-hidden="true"
    >
      <span className={styles.sweep} />
    </span>
  )
}
