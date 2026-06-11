import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { CalendarDragOverlay } from './CalendarDragOverlay'
import { dragAtom } from '../../hooks/calendar/calendar'
import type { DragState } from '../../hooks/calendar/calendar'

const mockDrag: DragState = {
  eventId: '1',
  mode: 'move',
  originalEvent: {
    id: '1',
    title: 'Test Event',
    startTime: new Date('2026-03-20T09:00:00'),
    endTime: new Date('2026-03-20T10:00:00'),
    color: '#4f46e5',
  },
  currentStartTime: new Date('2026-03-20T09:00:00'),
  currentEndTime: new Date('2026-03-20T10:00:00'),
  pointerX: 100,
  pointerY: 200,
}

describe('DragOverlay', () => {
  it('renders nothing when dragAtom is null', () => {
    const store = createStore()
    store.set(dragAtom, null)

    const { container } = render(
      <Provider store={store}>
        <CalendarDragOverlay />
      </Provider>
    )

    const overlay = document.querySelector('[data-component="DragOverlay"]')
    expect(overlay).toBeNull()
    expect(container.innerHTML).toBe('')
  })

  it('renders ghost when dragAtom has data', () => {
    const store = createStore()
    store.set(dragAtom, mockDrag)

    render(
      <Provider store={store}>
        <CalendarDragOverlay />
      </Provider>
    )

    const overlay = document.querySelector('[data-component="DragOverlay"]')
    expect(overlay).toBeTruthy()
    expect(overlay?.textContent).toContain('Test Event')
    expect(overlay?.textContent).toContain('09:00')
    expect(overlay?.textContent).toContain('10:00')
  })

  it('has data-component attribute', () => {
    const store = createStore()
    store.set(dragAtom, mockDrag)

    render(
      <Provider store={store}>
        <CalendarDragOverlay />
      </Provider>
    )

    const overlay = document.querySelector('[data-component="DragOverlay"]')
    expect(overlay).toBeTruthy()
    expect(overlay?.getAttribute('data-component')).toBe('DragOverlay')
  })
})
