'use client'

import type { CSSProperties, ReactNode } from 'react'

import styles from './Collapse.module.scss'

export interface CollapseProps {
  /** 開閉状態 (controlled)。true で開く。 */
  open: boolean
  /** 開いた時に表示する中身。閉じても DOM からは消えず、高さ 0 に畳まれる。 */
  children: ReactNode
  /** root 要素の id。trigger 側 `aria-controls` と対応させる用。 */
  id?: string
  /** アニメーション時間 (ms)。既定 360。 */
  durationMs?: number
  /** root に足す className (配置用)。 */
  className?: string
}

/**
 * 中身の高さを自動実測して滑らかに開閉する collapse primitive。
 *
 * `grid-template-rows: 0fr → 1fr` を transition することで、`max-height` の
 * マジックナンバー無しに任意の高さの中身を「スッ」と開閉する (中身が高くても
 * イージングがズレない・閉じ始めの遅延が出ない)。高さは outer の grid が、
 * フェード + せり上がりは inner の opacity / transform が担う 2 層構成。
 *
 * 開閉状態は持たない (controlled)。trigger の描画・aria-expanded は呼び出し側で。
 * `prefers-reduced-motion` 時は transition を切って即時表示に落とす (SCSS 側)。
 */
export function Collapse({ open, children, id, durationMs, className }: CollapseProps) {
  const style =
    durationMs != null
      ? ({ '--collapse-duration': `${durationMs}ms` } as CSSProperties)
      : undefined

  const rootClassName = [styles.collapse, className].filter(Boolean).join(' ')

  return (
    <div
      id={id}
      data-component="collapse"
      data-open={open}
      className={rootClassName}
      style={style}
    >
      <div className={styles.inner}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
