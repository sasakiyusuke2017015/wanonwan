import { useState } from 'react'
import { ColorPicker, EVENT_COLORS } from './ColorPicker'

export default {
  title: 'カレンダー/入力/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'カラーパレットから色を選択するピッカー。丸いスウォッチをクリックして選択する。',
      },
    },
  },
}

export const Default = {
  render: () => {
    const [value, setValue] = useState(EVENT_COLORS[0]!.value)
    return (
      <div>
        <ColorPicker value={value} onChange={setValue} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
          選択中: {value}
        </p>
      </div>
    )
  },
}

export const CustomColors = {
  render: () => {
    const palette = [
      { value: '#ef4444', label: 'Red' },
      { value: '#f97316', label: 'Orange' },
      { value: '#eab308', label: 'Yellow' },
      { value: '#22c55e', label: 'Green' },
      { value: '#3b82f6', label: 'Blue' },
    ]
    const [value, setValue] = useState(palette[0]!.value)
    return <ColorPicker value={value} onChange={setValue} colors={palette} />
  },
}

export const LargeSize = {
  render: () => {
    const [value, setValue] = useState(EVENT_COLORS[0]!.value)
    return <ColorPicker value={value} onChange={setValue} size={40} />
  },
}
