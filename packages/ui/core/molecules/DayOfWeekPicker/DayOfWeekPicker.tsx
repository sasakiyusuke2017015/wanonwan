'use client'

import { colors } from '@ui-catalog/core/tokens'
import type { DayOfWeek } from '../../types/calendar'
import styles from './DayOfWeekPicker.module.scss'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

const DAY_COLORS: Record<number, string> = {
  0: '#ef4444',
  6: '#3b82f6',
}

const DEFAULT_COLOR = '#4f46e5'

interface DayOfWeekPickerProps {
  readonly value: readonly DayOfWeek[]
  readonly onChange: (days: readonly DayOfWeek[]) => void
}

export function DayOfWeekPicker({ value, onChange }: DayOfWeekPickerProps) {
  const toggle = (dow: DayOfWeek) => {
    const active = value.includes(dow)
    const next = active
      ? value.filter((d) => d !== dow)
      : [...value, dow].sort()
    onChange(next)
  }

  return (
    <div data-component="DayOfWeekPicker" className={styles.container}>
      {([0, 1, 2, 3, 4, 5, 6] as const).map((dow) => {
        const active = value.includes(dow)
        const dayColor = DAY_COLORS[dow] ?? DEFAULT_COLOR
        return (
          <button
            key={dow}
            type="button"
            onClick={() => toggle(dow)}
            className={styles.dayButton}
            style={{
              fontWeight: active ? 600 : 500,
              color: active ? '#fff' : (DAY_COLORS[dow] ?? colors.text.secondary),
              backgroundColor: active ? dayColor : 'rgba(0,0,0,0.04)',
              boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {DAY_LABELS[dow]}
          </button>
        )
      })}
    </div>
  )
}
