import { useState } from 'react'
import { DayOfWeekPicker } from './DayOfWeekPicker'
import type { DayOfWeek } from '../../types/calendar'

export default {
  title: 'カレンダー/入力/DayOfWeekPicker',
  component: DayOfWeekPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '曜日選択ピッカー。丸型トグルボタンで複数曜日を選択可能。日曜は赤、土曜は青、平日はindigoで色分け。',
      },
    },
  },
}

export const Default = {
  render: () => {
    const [days, setDays] = useState<readonly DayOfWeek[]>([])
    return (
      <div>
        <DayOfWeekPicker value={days} onChange={setDays} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
          選択中: {days.length === 0 ? 'なし' : days.map((d) => ['日','月','火','水','木','金','土'][d]).join(', ')}
        </p>
      </div>
    )
  },
}

export const Weekdays = {
  render: () => {
    const [days, setDays] = useState<readonly DayOfWeek[]>([1, 2, 3, 4, 5])
    return <DayOfWeekPicker value={days} onChange={setDays} />
  },
}

export const Weekend = {
  render: () => {
    const [days, setDays] = useState<readonly DayOfWeek[]>([0, 6])
    return <DayOfWeekPicker value={days} onChange={setDays} />
  },
}

export const AllDays = {
  render: () => {
    const [days, setDays] = useState<readonly DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6])
    return <DayOfWeekPicker value={days} onChange={setDays} />
  },
}
