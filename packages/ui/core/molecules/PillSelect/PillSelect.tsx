'use client'

import { colors } from '@ui-catalog/core/tokens'
import styles from './PillSelect.module.scss'

interface PillOption {
  readonly value: string
  readonly label: string
}

interface PillSelectProps {
  readonly options: readonly PillOption[]
  readonly value: string
  readonly onChange: (value: string) => void
}

export function PillSelect({ options, value, onChange }: PillSelectProps) {
  return (
    <div data-component="PillSelect" className={styles.container}>
      {options.map(({ value: v, label }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={styles.pill}
            style={{
              fontWeight: active ? 600 : 400,
              color: active ? '#4f46e5' : colors.text.secondary,
              backgroundColor: active ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
              border: active ? '1.5px solid rgba(79, 70, 229, 0.3)' : '1.5px solid transparent',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
