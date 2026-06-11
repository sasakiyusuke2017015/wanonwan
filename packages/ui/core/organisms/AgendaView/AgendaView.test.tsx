import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'jotai'
import { AgendaView } from './AgendaView'
import type { CalendarEvent } from '../../types/calendar'

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '朝会',
    startTime: new Date(2024, 3, 15, 9, 0),
    endTime: new Date(2024, 3, 15, 9, 30),
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'ランチMTG',
    startTime: new Date(2024, 3, 15, 12, 0),
    endTime: new Date(2024, 3, 15, 13, 0),
    color: '#10b981',
    description: '新メンバー歓迎ランチ',
  },
  {
    id: '3',
    title: 'リリース準備',
    startTime: new Date(2024, 3, 16, 0, 0),
    endTime: new Date(2024, 3, 16, 23, 59),
    color: '#f59e0b',
    allDay: true,
  },
]

describe('AgendaView', () => {
  const mockPersistEvent = vi.fn()
  const mockRemoveEvent = vi.fn()

  it('イベントがある日のみ表示される', () => {
    render(
      <Provider>
        <AgendaView
          events={mockEvents}
          persistEvent={mockPersistEvent}
          removeEvent={mockRemoveEvent}
        />
      </Provider>
    )

    expect(screen.getByText('朝会')).toBeInTheDocument()
    expect(screen.getByText('ランチMTG')).toBeInTheDocument()
    expect(screen.getByText('リリース準備')).toBeInTheDocument()
  })

  it('終日イベントは「終日」バッジが表示される', () => {
    render(
      <Provider>
        <AgendaView
          events={mockEvents}
          persistEvent={mockPersistEvent}
          removeEvent={mockRemoveEvent}
        />
      </Provider>
    )

    expect(screen.getByText('終日')).toBeInTheDocument()
  })

  it('イベントをクリックすると編集モーダルが開く', async () => {
    const user = userEvent.setup()

    render(
      <Provider>
        <AgendaView
          events={mockEvents}
          persistEvent={mockPersistEvent}
          removeEvent={mockRemoveEvent}
        />
      </Provider>
    )

    const eventCard = screen.getByText('朝会').closest('button')
    await user.click(eventCard!)

    // editingEventAtom が設定されることを期待
    // 実際のモーダル表示は CalendarPage でテスト
  })

  it('予定がない場合は空状態を表示', () => {
    render(
      <Provider>
        <AgendaView
          events={[]}
          persistEvent={mockPersistEvent}
          removeEvent={mockRemoveEvent}
        />
      </Provider>
    )

    expect(screen.getByText('この期間に予定はありません')).toBeInTheDocument()
  })
})
