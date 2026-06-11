import { EventPopover } from './EventPopover'
import type { HoveredEvent } from '../../hooks/calendar/calendar'

export default {
  title: 'カレンダー/イベント/EventPopover',
  component: EventPopover,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'イベントカードにホバーした際に表示されるポップオーバー。イベントの詳細情報を表示する。',
      },
    },
  },
}

const baseHovered: HoveredEvent = {
  event: {
    id: '1',
    title: 'チームミーティング',
    startTime: new Date(2026, 2, 20, 10, 0),
    endTime: new Date(2026, 2, 20, 11, 0),
    color: '#4f46e5',
    description: 'プロジェクトの進捗確認と次のスプリント計画について話し合います。',
  },
  rect: { top: 200, left: 100, right: 300, bottom: 280, width: 200 },
}

export const Default = {
  render: () => <EventPopover hovered={baseHovered} />,
}

export const WithoutDescription = {
  render: () => {
    const hovered: HoveredEvent = {
      ...baseHovered,
      event: {
        ...baseHovered.event,
        description: undefined,
      },
    }
    return <EventPopover hovered={hovered} />
  },
}

export const AllDayEvent = {
  render: () => {
    const hovered: HoveredEvent = {
      ...baseHovered,
      event: {
        id: '2',
        title: '休暇',
        startTime: new Date(2026, 2, 20, 0, 0),
        endTime: new Date(2026, 2, 20, 23, 59),
        color: '#059669',
        allDay: true,
      },
    }
    return <EventPopover hovered={hovered} />
  },
}

export const MultiDayEvent = {
  render: () => {
    const hovered: HoveredEvent = {
      ...baseHovered,
      event: {
        id: '3',
        title: '出張',
        startTime: new Date(2026, 2, 20, 9, 0),
        endTime: new Date(2026, 2, 22, 18, 0),
        color: '#dc2626',
        description: '東京オフィスでのクライアントミーティング',
      },
    }
    return <EventPopover hovered={hovered} />
  },
}
