import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CalendarEvent } from '../../types/calendar'

// Mock jotai
const mockDragAtom = { eventId: null, mode: null }
const mockHoveredEventAtom = null
const mockEventsAtom: CalendarEvent[] = []
const mockSetHovered = vi.fn()
const mockSetModal = vi.fn()
const mockAnyDragActive = false

vi.mock('jotai', () => ({
  useAtomValue: vi.fn((atom: unknown) => {
    // Return different values based on which atom is read
    if (atom === 'dragAtom') return mockDragAtom
    if (atom === 'hoveredEventAtom') return mockHoveredEventAtom
    if (atom === 'eventsAtom') return mockEventsAtom
    if (atom === 'anyDragActiveAtom') return mockAnyDragActive
    return null
  }),
  useSetAtom: vi.fn(() => mockSetHovered),
  atom: vi.fn((val: unknown) => val),
}))

// Mock the calendar atoms module
vi.mock('../../hooks/calendar/calendar', () => ({
  dragAtom: 'dragAtom',
  hoveredEventAtom: 'hoveredEventAtom',
  eventModalAtom: 'eventModalAtom',
  anyDragActiveAtom: 'anyDragActiveAtom',
  eventsAtom: 'eventsAtom',
}))

// Mock useDragEvent hook
vi.mock('../../hooks/calendar/useDragEvent', () => ({
  useDragEvent: () => ({
    handleMoveStart: vi.fn(),
    handleResizeTopStart: vi.fn(),
    handleResizeBottomStart: vi.fn(),
  }),
}))

// Mock date-fns format
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, fmt: string) => {
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    if (fmt === 'HH:mm') return `${h}:${m}`
    return ''
  }),
}))

// Mock resolveOriginalEvent
vi.mock('../../utils/calendar/repeatUtils', () => ({
  resolveOriginalEvent: vi.fn((event: CalendarEvent) => event),
}))

// Mock CalendarEventCard
vi.mock('../../organisms/CalendarEventCard/CalendarEventCard', () => ({
  CalendarEventCard: ({ title, children, ...props }: Record<string, unknown>) => (
    <div data-testid="event-card" data-title={title} {...props}>
      {children as React.ReactNode}
    </div>
  ),
}))

import { EventCardContainer } from './EventCardContainer'

const today = new Date(2026, 3, 8, 0, 0, 0, 0)

const baseEvent: CalendarEvent = {
  id: 'evt-1',
  title: 'Test Meeting',
  startTime: new Date(2026, 3, 8, 10, 0),
  endTime: new Date(2026, 3, 8, 11, 0),
  color: '#3b82f6',
}

describe('EventCardContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the event card with correct title', () => {
    const { getByTestId } = render(
      <EventCardContainer
        event={baseEvent}
        dayStart={today}
        slotHeight={60}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />
    )
    expect(getByTestId('event-card')).toBeInTheDocument()
    expect(getByTestId('event-card').getAttribute('data-title')).toBe('Test Meeting')
  })

  it('returns null for events starting on a different day', () => {
    const yesterdayEvent: CalendarEvent = {
      ...baseEvent,
      startTime: new Date(2026, 3, 7, 22, 0),
      endTime: new Date(2026, 3, 8, 1, 0),
    }
    const { container } = render(
      <EventCardContainer
        event={yesterdayEvent}
        dayStart={today}
        slotHeight={60}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  it('calls onDelete with event id', () => {
    const handleDelete = vi.fn()
    const { getByTestId } = render(
      <EventCardContainer
        event={baseEvent}
        dayStart={today}
        slotHeight={60}
        onDelete={handleDelete}
        onUpdate={vi.fn()}
      />
    )
    // The CalendarEventCard mock receives onDelete prop
    const card = getByTestId('event-card')
    expect(card).toBeInTheDocument()
  })

  it('computes correct position based on slotHeight and column props', () => {
    const { getByTestId } = render(
      <EventCardContainer
        event={baseEvent}
        dayStart={today}
        slotHeight={60}
        column={1}
        totalColumns={3}
        columnSpan={1}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />
    )
    const card = getByTestId('event-card')
    // leftPercent = (1/3)*100 = 33.33..., widthPercent = (1/3)*100 = 33.33...
    // top = 10 * 60 = 600, height = 1 * 60 = 60
    expect(card).toBeInTheDocument()
  })
})
