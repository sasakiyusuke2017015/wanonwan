import { TimeSlotRow } from './TimeSlotRow'

export default {
  title: 'カレンダー/日表示/TimeSlotRow',
  component: TimeSlotRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'タイムラインの1時間分のスロットを描画するコンポーネント。',
      },
    },
  },
}

export const Default = {
  render: () => (
    <div style={{ width: '400px' }}>
      <TimeSlotRow label="09:00" />
    </div>
  ),
}

export const Active = {
  render: () => (
    <div style={{ width: '400px' }}>
      <TimeSlotRow label="10:00" isActive />
    </div>
  ),
}

export const CurrentHour = {
  render: () => (
    <div style={{ width: '400px' }}>
      <TimeSlotRow label="14:00" isCurrentHour />
    </div>
  ),
}

export const CustomHeight = {
  render: () => (
    <div style={{ width: '400px' }}>
      <TimeSlotRow label="11:00" slotHeight={80} />
    </div>
  ),
}

export const MultipleSlots = {
  render: () => {
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00']
    return (
      <div style={{ width: '400px' }}>
        {hours.map((label, i) => (
          <TimeSlotRow
            key={label}
            label={label}
            isActive={i === 1}
            isCurrentHour={i === 3}
          />
        ))}
      </div>
    )
  },
}
