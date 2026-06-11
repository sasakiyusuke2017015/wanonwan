import type { Meta, StoryObj } from '@storybook/react'
import { Provider } from 'jotai'
import { CalendarPage } from './CalendarPage'
import type { CalendarEvent } from '../../types/calendar'

const meta: Meta<typeof CalendarPage> = {
  title: 'テンプレート/CalendarPage',
  component: CalendarPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Provider>
        <div style={{ height: '100vh' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CalendarPage>

const now = new Date()
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'チームミーティング',
    startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
    endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0),
    color: '#4F46E5',
    mode: 'time' as const,
  },
  {
    id: '2',
    title: 'ランチ',
    startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
    endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
    color: '#059669',
    mode: 'time' as const,
  },
]

const noop = async () => {}

export const Default: Story = {
  args: {
    events: sampleEvents,
    persistEvent: noop,
    removeEvent: noop,
  },
}

export const Empty: Story = {
  args: {
    events: [],
    persistEvent: noop,
    removeEvent: noop,
  },
}
