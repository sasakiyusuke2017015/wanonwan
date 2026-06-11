'use client'

import styles from './TimeSelect.module.scss'

// 97個: 00:00 ~ 24:00 (24:00 = 翌日0時、終了時刻用)
const TIME_OPTIONS = Array.from({ length: 97 }, (_, i) => {
  const h = Math.floor(i / 4)
  const m = (i % 4) * 15
  return {
    value: h * 60 + m,
    label: h === 24 ? '24:00' : `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
  }
})

interface TimeSelectProps {
  readonly value: number
  readonly onChange: (minutes: number) => void
  readonly error?: boolean
  readonly className?: string
}

export function TimeSelect({ value, onChange, error = false, className = '' }: TimeSelectProps) {
  return (
    <select
      data-component="TimeSelect"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${styles.select} ${error ? styles.error : ''} ${className}`}
      style={error ? { borderColor: '#dc2626' } : undefined}
    >
      {TIME_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
