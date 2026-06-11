import { Provider, createStore } from 'jotai'
import { CalendarDragOverlay } from './CalendarDragOverlay'
import { dragAtom } from '../../hooks/calendar/calendar'
import type { DragState } from '../../hooks/calendar/calendar'

export default {
  title: 'カレンダー/ドラッグ/CalendarDragOverlay',
  component: CalendarDragOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'ドラッグ操作中にカーソルに追従するゴーストカード。',
      },
    },
  },
}

function makeDrag(overrides: Partial<DragState> = {}): DragState {
  return {
    eventId: '1',
    mode: 'move',
    originalEvent: {
      id: '1',
      title: 'チームミーティング',
      startTime: new Date(2026, 2, 20, 10, 0),
      endTime: new Date(2026, 2, 20, 11, 0),
      color: '#4f46e5',
    },
    currentStartTime: new Date(2026, 2, 20, 10, 0),
    currentEndTime: new Date(2026, 2, 20, 11, 0),
    pointerX: 200,
    pointerY: 300,
    ...overrides,
  }
}

export const MoveMode = {
  render: () => {
    const store = createStore()
    store.set(dragAtom, makeDrag())
    return (
      <Provider store={store}>
        <div style={{ height: '100vh', background: '#f0f0f0', position: 'relative' }}>
          <p style={{ padding: 24 }}>移動ドラッグ中のゴーストカード</p>
          <CalendarDragOverlay />
        </div>
      </Provider>
    )
  },
}

export const ResizeTopMode = {
  render: () => {
    const store = createStore()
    store.set(dragAtom, makeDrag({
      mode: 'resize-top',
      currentStartTime: new Date(2026, 2, 20, 9, 30),
    }))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh', background: '#f0f0f0', position: 'relative' }}>
          <p style={{ padding: 24 }}>上端リサイズ中（開始時刻を9:30に変更）</p>
          <CalendarDragOverlay />
        </div>
      </Provider>
    )
  },
}

export const ResizeBottomMode = {
  render: () => {
    const store = createStore()
    store.set(dragAtom, makeDrag({
      mode: 'resize-bottom',
      currentEndTime: new Date(2026, 2, 20, 12, 0),
    }))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh', background: '#f0f0f0', position: 'relative' }}>
          <p style={{ padding: 24 }}>下端リサイズ中（終了時刻を12:00に延長）</p>
          <CalendarDragOverlay />
        </div>
      </Provider>
    )
  },
}

export const LongEvent = {
  render: () => {
    const store = createStore()
    store.set(dragAtom, makeDrag({
      originalEvent: {
        id: '2',
        title: 'オフサイトミーティング',
        startTime: new Date(2026, 2, 20, 9, 0),
        endTime: new Date(2026, 2, 20, 17, 0),
        color: '#059669',
      },
      currentStartTime: new Date(2026, 2, 20, 9, 0),
      currentEndTime: new Date(2026, 2, 20, 17, 0),
    }))
    return (
      <Provider store={store}>
        <div style={{ height: '100vh', background: '#f0f0f0', position: 'relative' }}>
          <p style={{ padding: 24 }}>長時間イベントのドラッグ</p>
          <CalendarDragOverlay />
        </div>
      </Provider>
    )
  },
}

export const NoDrag = {
  render: () => {
    const store = createStore()
    store.set(dragAtom, null)
    return (
      <Provider store={store}>
        <div style={{ height: '100vh', background: '#f0f0f0' }}>
          <p style={{ padding: 24 }}>ドラッグ無し — ゴーストカードは表示されません。</p>
          <CalendarDragOverlay />
        </div>
      </Provider>
    )
  },
}
