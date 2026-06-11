'use client'

import { format } from 'date-fns'
import { Icon } from '../../atoms/Icon'
import type { IconName } from '../../constants'
import type { CalendarEvent } from '../../types/calendar'
import styles from './MonthEventCard.module.scss'

interface MonthEventCardProps {
  readonly event: CalendarEvent
  readonly isDragging: boolean
  readonly isHovered: boolean
  readonly onClick: (e: React.MouseEvent) => void
  readonly onPointerDown: (e: React.PointerEvent) => void
  readonly onMouseEnter: (e: React.MouseEvent) => void
  readonly onMouseLeave: () => void
}

/**
 * 月表示の時間指定イベントカード（ドット + 時刻 + タイトル）
 * 全日イベントは SpanningBar で表示される
 */
export function MonthEventCard({ event, isDragging, isHovered, onClick, onPointerDown, onMouseEnter, onMouseLeave }: MonthEventCardProps) {
  return (
    <div
      data-component="MonthEventCard"
      className={`${styles.card} ${isHovered ? styles.hovered : ''}`}
      style={{
        opacity: isDragging ? 0.3 : 1,
        filter: isDragging ? 'grayscale(0.4)' : 'none',
        backgroundColor: isHovered ? `${event.color}18` : undefined,
        boxShadow: isHovered ? `inset 2px 0 0 ${event.color}` : 'none',
        transition: 'opacity 150ms ease, filter 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
      }}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon name={(event.icon ?? 'dot') as IconName} size={12} className="shrink-0" style={{ color: event.color }} />
      <span className={styles.time}>
        {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
      </span>
      <span className={styles.title}>
        {event.title}
      </span>
    </div>
  )
}
