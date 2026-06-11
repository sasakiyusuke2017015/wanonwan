import { useState } from 'react'
import { PillSelect } from './PillSelect'

export default {
  title: 'カレンダー/入力/PillSelect',
  component: PillSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ピル型のラジオセレクト。排他的な選択肢を等幅ボタンで表示する。',
      },
    },
  },
}

const modeOptions = [
  { value: 'normal', label: '時間指定' },
  { value: 'allDay', label: '終日' },
  { value: 'repeat', label: '繰り返し' },
]

export const Default = {
  render: () => {
    const [value, setValue] = useState('normal')
    return (
      <div style={{ width: '340px' }}>
        <PillSelect options={modeOptions} value={value} onChange={setValue} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
          選択中: {value}
        </p>
      </div>
    )
  },
}

export const TwoOptions = {
  render: () => {
    const [value, setValue] = useState('on')
    return (
      <div style={{ width: '240px' }}>
        <PillSelect
          options={[
            { value: 'on', label: 'オン' },
            { value: 'off', label: 'オフ' },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    )
  },
}

export const ManyOptions = {
  render: () => {
    const [value, setValue] = useState('daily')
    return (
      <div style={{ width: '400px' }}>
        <PillSelect
          options={[
            { value: 'daily', label: '毎日' },
            { value: 'weekly', label: '毎週' },
            { value: 'monthly', label: '毎月' },
            { value: 'yearly', label: '毎年' },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    )
  },
}
