import { useState } from 'react'
import { TimeSelect } from './TimeSelect'

export default {
  title: 'カレンダー/入力/TimeSelect',
  component: TimeSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '15分刻みの時刻選択セレクトボックス。値は分数（0-1425）で管理される。',
      },
    },
  },
}

export const Default = {
  render: () => {
    const [value, setValue] = useState(9 * 60)
    return (
      <div>
        <TimeSelect value={value} onChange={setValue} />
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
          選択中: {Math.floor(value / 60)}時{value % 60}分
        </p>
      </div>
    )
  },
}

export const WithError = {
  render: () => {
    const [value, setValue] = useState(10 * 60)
    return (
      <div>
        <TimeSelect value={value} onChange={setValue} error />
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#dc2626' }}>
          開始時刻より前の時刻が選択されています
        </p>
      </div>
    )
  },
}

export const StartAndEnd = {
  render: () => {
    const [start, setStart] = useState(9 * 60)
    const [end, setEnd] = useState(10 * 60)
    const hasError = end <= start
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TimeSelect value={start} onChange={setStart} />
        <span style={{ color: '#6b7280' }}>-</span>
        <TimeSelect value={end} onChange={setEnd} error={hasError} />
      </div>
    )
  },
}
