'use client'

/**
 * TimeSlotRow コンポーネント
 * タイムラインの1時間分のスロットを描画する
 */
import styles from './TimeSlotRow.module.scss'

interface TimeSlotRowProps {
  /** 表示用の時刻ラベル（例: "09:00"） */
  readonly label: string
  /** アクティブ（選択中）状態 */
  readonly isActive?: boolean
  /** 現在の時間帯かどうか */
  readonly isCurrentHour?: boolean
  /** スロット高さ（px）。デフォルト: 56 */
  readonly slotHeight?: number
  /** ラベル列幅（px）。デフォルト: 64 */
  readonly labelWidth?: number
  /** クリック時のコールバック */
  readonly onClick?: () => void
  /** 追加の className */
  readonly className?: string
}

export function TimeSlotRow({
  label,
  isActive = false,
  isCurrentHour = false,
  slotHeight = 56,
  labelWidth = 64,
  onClick,
  className = '',
}: TimeSlotRowProps) {
  return (
    <div
      data-component="TimeSlotRow"
      className={`${styles.row} ${className}`}
      style={{
        gridTemplateColumns: `${labelWidth}px 1fr`,
        height: `${slotHeight}px`,
      }}
      onClick={onClick}
    >
      <div className={styles.label}>
        {label}
      </div>

      <div
        className={`${styles.slot} ${
          isCurrentHour ? styles.currentHour : ''
        } ${isActive ? styles.active : ''}`}
      >
        {isActive && (
          <div className={styles.activeIndicator} />
        )}
        {isCurrentHour && (
          <div className={styles.currentTimeLine}>
            <div className={styles.currentTimeDot} />
          </div>
        )}
      </div>
    </div>
  )
}

export type { TimeSlotRowProps }
