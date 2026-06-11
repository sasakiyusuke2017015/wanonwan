import type { Meta, StoryObj } from '@storybook/react'
import { Provider } from 'jotai'
import { AgendaView } from './AgendaView'
import type { CalendarEvent } from '../../types/calendar'

const meta = {
  title: 'Organisms/AgendaView',
  component: AgendaView,
  decorators: [
    (Story) => (
      <Provider>
        <div style={{ height: '600px' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AgendaView>

export default meta
type Story = StoryObj<typeof meta>

const now = new Date()
const today = now.getDate()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '朝会',
    startTime: new Date(currentYear, currentMonth, today, 9, 0),
    endTime: new Date(currentYear, currentMonth, today, 9, 30),
    color: '#3b82f6',
    description: 'チーム全体の朝礼',
    icon: 'users-group',
  },
  {
    id: '2',
    title: 'プロジェクト進捗確認',
    startTime: new Date(currentYear, currentMonth, today, 10, 0),
    endTime: new Date(currentYear, currentMonth, today, 11, 0),
    color: '#8b5cf6',
    description: '週次の進捗確認MTG',
  },
  {
    id: '3',
    title: 'ランチMTG',
    startTime: new Date(currentYear, currentMonth, today, 12, 0),
    endTime: new Date(currentYear, currentMonth, today, 13, 0),
    color: '#10b981',
    description: '新メンバー歓迎ランチ',
    icon: 'chat',
  },
  {
    id: '4',
    title: 'コードレビュー',
    startTime: new Date(currentYear, currentMonth, today, 15, 0),
    endTime: new Date(currentYear, currentMonth, today, 16, 0),
    color: '#f59e0b',
    description: 'PR #123 のレビュー',
    icon: 'file',
  },
  {
    id: '5',
    title: '1on1面談',
    startTime: new Date(currentYear, currentMonth, today + 1, 14, 0),
    endTime: new Date(currentYear, currentMonth, today + 1, 15, 0),
    color: '#ec4899',
    description: '月次1on1面談',
    icon: 'person',
  },
  {
    id: '6',
    title: 'リリース準備',
    startTime: new Date(currentYear, currentMonth, today + 2, 0, 0),
    endTime: new Date(currentYear, currentMonth, today + 2, 23, 59),
    color: '#f59e0b',
    allDay: true,
    description: 'v2.0リリース準備作業',
  },
  {
    id: '7',
    title: '部門会議',
    startTime: new Date(currentYear, currentMonth, today + 2, 13, 0),
    endTime: new Date(currentYear, currentMonth, today + 2, 14, 30),
    color: '#3b82f6',
    description: '月次部門全体会議',
    icon: 'users-group',
  },
  {
    id: '8',
    title: 'スプリントレビュー',
    startTime: new Date(currentYear, currentMonth, today + 3, 15, 0),
    endTime: new Date(currentYear, currentMonth, today + 3, 16, 30),
    color: '#8b5cf6',
    description: 'スプリント成果発表',
  },
  {
    id: '9',
    title: '顧客訪問',
    startTime: new Date(currentYear, currentMonth, today + 7, 10, 0),
    endTime: new Date(currentYear, currentMonth, today + 7, 12, 0),
    color: '#10b981',
    description: 'A社様への提案',
    icon: 'arrow-up-right',
  },
  {
    id: '10',
    title: '技術勉強会',
    startTime: new Date(currentYear, currentMonth, today + 8, 17, 0),
    endTime: new Date(currentYear, currentMonth, today + 8, 18, 30),
    color: '#f59e0b',
    description: 'React 19新機能について',
    icon: 'list',
  },
]

const mockPersistEvent = async (event: CalendarEvent) => {
  console.log('persistEvent:', event)
}

const mockRemoveEvent = async (id: string) => {
  console.log('removeEvent:', id)
}

export const Default: Story = {
  args: {
    events: mockEvents,
    persistEvent: mockPersistEvent,
    removeEvent: mockRemoveEvent,
  },
}

export const Empty: Story = {
  args: {
    events: [],
    persistEvent: mockPersistEvent,
    removeEvent: mockRemoveEvent,
  },
}

export const SingleDay: Story = {
  args: {
    events: mockEvents.slice(0, 4),
    persistEvent: mockPersistEvent,
    removeEvent: mockRemoveEvent,
  },
}

export const AllDayEvents: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'プロジェクトキックオフ',
        startTime: new Date(currentYear, currentMonth, today, 0, 0),
        endTime: new Date(currentYear, currentMonth, today, 23, 59),
        color: '#3b82f6',
        allDay: true,
      },
      {
        id: '2',
        title: 'リリース日',
        startTime: new Date(currentYear, currentMonth, today + 1, 0, 0),
        endTime: new Date(currentYear, currentMonth, today + 1, 23, 59),
        color: '#f59e0b',
        allDay: true,
      },
    ],
    persistEvent: mockPersistEvent,
    removeEvent: mockRemoveEvent,
  },
}
