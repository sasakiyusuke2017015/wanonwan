import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { colors } from '@ui-catalog/core/tokens'
import { IconLabel } from '../../molecules/IconLabel/IconLabel'
import { getStickyBottom } from '../../utils/calendar/dom'
import type { HoveredEvent } from '../../hooks/calendar/calendar'

interface EventPopoverProps {
  readonly hovered: HoveredEvent
}

type Placement = 'right' | 'left' | 'bottom' | 'top'

const POP_W = 320
const POP_H_EST = 180
const GAP = 8

function getPlacement(rect: HoveredEvent['rect']): Placement {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const minTop = getStickyBottom()

  // Can the popover fit to the right AND vertically overlap with the card?
  const canRight = rect.right + GAP + POP_W < vw
  const canLeft = rect.left - GAP - POP_W > 0

  if (canRight || canLeft) {
    // Check: would the popover's vertical range overlap with the card?
    const visTop = Math.max(rect.top, minTop)
    const popTop = Math.max(minTop, visTop)
    const popBottom = popTop + POP_H_EST
    // If the card's visible top is within the popover's range, side placement works
    if (visTop < popBottom && rect.bottom > popTop) {
      return canRight ? 'right' : 'left'
    }
  }

  // Card is too low/high for side placement — use top or bottom
  if (rect.top - POP_H_EST > minTop) return 'top'
  if (rect.bottom + POP_H_EST < vh) return 'bottom'
  return canRight ? 'right' : 'top'
}

function computeLayout(rect: HoveredEvent['rect'], placement: Placement) {
  const cardCenterX = (rect.left + rect.right) / 2
  const vh = window.innerHeight

  const minTop = getStickyBottom()

  // Clamp card rect to visible content area
  const visTop = Math.max(rect.top, minTop)
  const visBottom = Math.min(rect.bottom, vh)
  const visH = Math.max(visBottom - visTop, 20)

  switch (placement) {
    case 'right': {
      const popLeft = rect.right + GAP
      const anchor = visTop + visH * 0.2
      const popTop = Math.max(minTop, Math.min(anchor - 20, vh - POP_H_EST - 8))
      const arrowTop = Math.max(14, Math.min(anchor - popTop, POP_H_EST - 30))
      return { popLeft, popTop, popBottom: undefined, arrowTop, arrowLeft: undefined }
    }
    case 'left': {
      const popLeft = rect.left - POP_W - GAP
      const anchor = visTop + visH * 0.2
      const popTop = Math.max(minTop, Math.min(anchor - 20, vh - POP_H_EST - 8))
      const arrowTop = Math.max(14, Math.min(anchor - popTop, POP_H_EST - 30))
      return { popLeft, popTop, popBottom: undefined, arrowTop, arrowLeft: undefined }
    }
    case 'bottom': {
      const popLeft = Math.max(8, Math.min(cardCenterX - POP_W / 2, window.innerWidth - POP_W - 8))
      const popTop = rect.bottom + GAP
      const arrowLeft = Math.max(16, Math.min(cardCenterX - popLeft, POP_W - 32))
      return { popLeft, popTop, popBottom: undefined, arrowTop: undefined, arrowLeft }
    }
    case 'top': {
      const popLeft = Math.max(8, Math.min(cardCenterX - POP_W / 2, window.innerWidth - POP_W - 8))
      const popBottom = vh - rect.top + GAP
      const arrowLeft = Math.max(16, Math.min(cardCenterX - popLeft, POP_W - 32))
      return { popLeft, popTop: undefined, popBottom, arrowTop: undefined, arrowLeft}

    }
  }
}

const WEEKDAY_LABELS_SHORT = ['日', '月', '火', '水', '木', '金', '土'] as const

function formatRepeatDays(days: readonly number[]): string {
  const sorted = [...days].sort((a, b) => a - b)
  return sorted.map((d) => WEEKDAY_LABELS_SHORT[d]).join('・')
}

export function EventPopover({ hovered }: EventPopoverProps) {
  const { event, rect } = hovered

  const startDate = format(event.startTime, 'M月d日(E)', { locale: ja })
  const startTime = format(event.startTime, 'HH:mm')
  const endTime = format(event.endTime, 'HH:mm')
  const endDate = format(event.endTime, 'M月d日(E)', { locale: ja })
  const sameDay = event.startTime.toDateString() === event.endTime.toDateString()
  const isRepeat = event.repeat && event.repeat.length > 0

  const placement = getPlacement(rect)
  const layout = computeLayout(rect, placement)

  const minTopForRender = getStickyBottom()
  const vh = window.innerHeight

  const posStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${layout.popLeft}px`,
    width: `${POP_W}px`,
    zIndex: 30,
    pointerEvents: 'none',
    animation: 'popover-in 0.2s ease-out',
  }

  if (layout.popBottom !== undefined) {
    posStyle.bottom = `${layout.popBottom}px`
    // Don't let it extend above the header
    const maxH = vh - layout.popBottom - minTopForRender
    if (maxH > 0) {
      posStyle.maxHeight = `${maxH}px`
      posStyle.overflow = 'hidden'
    }
  } else if (layout.popTop !== undefined) {
    posStyle.top = `${Math.max(layout.popTop, minTopForRender)}px`
  }

  return (
    <div data-component="EventPopover" style={posStyle}>
      <div style={{
        background: colors.surface.popover,
        borderRadius: '14px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{ height: '4px', background: event.color }} />

        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text.primary, lineHeight: 1.3, marginBottom: '10px' }}>
            <IconLabel icon={event.icon} iconSize={18} iconColor={event.color}>{event.title}</IconLabel>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: event.color, flexShrink: 0, marginTop: '4px' }} />
            <div style={{ fontSize: '13px', color: colors.text.secondary, lineHeight: 1.6 }}>
              {isRepeat ? (
                <>
                  <div>{`毎週 ${formatRepeatDays(event.repeat!)}  ${startTime} - ${endTime}`}</div>
                  <div style={{ fontSize: '12px', color: colors.text.muted }}>
                    {`${format(event.repeatPeriodStart ?? event.startTime, 'M月d日', { locale: ja })} 〜 ${format(event.repeatPeriodEnd ?? event.endTime, 'M月d日', { locale: ja })}`}
                  </div>
                </>
              ) : event.allDay ? (
                sameDay ? `${startDate} 終日` : `${startDate} - ${endDate}`
              ) : (
                sameDay
                  ? `${startDate} ${startTime} - ${endTime}`
                  : `${startDate} ${startTime} - ${endDate} ${endTime}`
              )}
            </div>
          </div>

          {event.description && (
            <div style={{
              fontSize: '13px',
              color: colors.text.muted,
              lineHeight: 1.5,
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: `1px solid ${colors.border.light}`,
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
            }}>
              {event.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
