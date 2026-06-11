import { FC, ReactNode } from 'react'

import styles from './Ticket.module.scss'

export interface TicketProps {
  /** チケット左側のメイン領域 */
  children: ReactNode
  /** チケット右側の半券領域（任意） */
  stub?: ReactNode
  /** 切り欠きのサイズ（px、既定 16） */
  notchSize?: number
  /** 追加クラス */
  className?: string
}

/**
 * チケット型コンポーネント
 *
 * border-shape で半円の切り欠きをチケットの輪郭として描画する。
 * box-shadow が切り欠きの形に追従するので filter: drop-shadow() のハック不要。
 *
 * 対応ブラウザ: Chrome / Edge 147+ のみ（Firefox / Safari 未対応）
 */
export const Ticket: FC<TicketProps> = ({ children, stub, notchSize = 16, className = '' }) => {
  const style = { '--ticket-notch': `${notchSize}px` } as React.CSSProperties

  return (
    <div
      className={[styles.ticket, className].filter(Boolean).join(' ')}
      style={style}
      data-component="ticket"
    >
      <div className={styles.ticket__main}>{children}</div>
      {stub && <div className={styles.ticket__stub}>{stub}</div>}
    </div>
  )
}
