'use client'

/**
 * DragOverlay - ghost card that follows the cursor during drag operations.
 * Uses useDragGhost hook for ref-based DOM manipulation + rAF.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAtomValue } from 'jotai'
import { format } from 'date-fns'
import { IconLabel } from '../../molecules/IconLabel/IconLabel'
import { dragAtom } from '../../hooks/calendar/calendar'
import { useDragGhost } from '../../hooks/calendar/useDragGhost'
import type { DragState } from '../../hooks/calendar/calendar'
import styles from './CalendarDragOverlay.module.scss'

function GhostCard({ drag }: { readonly drag: DragState }) {
  const [visible, setVisible] = useState(false)
  const ghostRef = useDragGhost({
    initialX: drag.pointerX,
    initialY: drag.pointerY,
    offsetY: -16,
  })

  // Entry animation: show after mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  const startLabel = format(drag.currentStartTime, 'HH:mm')
  const endLabel = format(drag.currentEndTime, 'HH:mm')

  return (
    <div ref={ghostRef} className={styles.overlay}>
      <div
        className={`${styles.ghost} ${visible ? styles.ghostVisible : ''}`}
        style={{ backgroundColor: `${drag.originalEvent.color}e6` }}
      >
        <div className={styles.ghostTitle}>
          <IconLabel icon={drag.originalEvent.icon} iconSize={14}>{drag.originalEvent.title}</IconLabel>
        </div>
        <div className={styles.ghostTime}>
          {startLabel} - {endLabel}
        </div>
      </div>
    </div>
  )
}

export function CalendarDragOverlay() {
  const drag = useAtomValue(dragAtom)

  if (!drag || drag.mode !== 'move') return null

  return createPortal(
    <div data-component="CalendarDragOverlay">
      <GhostCard drag={drag} />
    </div>,
    document.body
  )
}
