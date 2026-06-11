import { FC, ReactNode } from 'react'

import styles from './ScallopedCard.module.scss'

export interface ScallopedCardProps {
  /** カード内コンテンツ */
  children: ReactNode
  /** 追加クラス */
  className?: string
}

/**
 * スカラップエッジ（波々の輪郭）を持つカード
 *
 * border-shape の arc を繰り返して波エッジを輪郭として描画する。
 * クーポン / プロモーションカード等に使う。
 *
 * 対応ブラウザ: Chrome / Edge 147+ のみ（Firefox / Safari 未対応）
 */
export const ScallopedCard: FC<ScallopedCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-component="scalloped-card"
    >
      {children}
    </div>
  )
}
