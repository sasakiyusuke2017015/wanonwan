import { createPortal } from 'react-dom'
import { IconLabel } from '../../molecules/IconLabel/IconLabel'
import { useDragGhost } from '../../hooks/calendar/useDragGhost'
import type { CalendarEvent } from '../../types/calendar'
import styles from './MonthDragOverlay.module.scss'

interface MonthDragOverlayProps {
  readonly event: CalendarEvent | null
  readonly initialPointer: { x: number; y: number } | null
}

export function MonthDragOverlay({ event, initialPointer }: MonthDragOverlayProps) {
  const ghostRef = useDragGhost({
    initialX: initialPointer?.x ?? 0,
    initialY: initialPointer?.y ?? 0,
    offsetY: -12,
    enabled: !!event && !!initialPointer,
  })

  if (!event || !initialPointer) return null

  return createPortal(
    <div ref={ghostRef} className={styles.overlay} data-component="MonthDragOverlay">
      <div
        className={styles.ghost}
        style={{ borderLeftColor: event.color }}
      >
        <IconLabel icon={event.icon ?? 'dot'} iconSize={12} iconColor={event.color}><span className={styles.title}>{event.title}</span></IconLabel>
      </div>
    </div>,
    document.body,
  )
}
