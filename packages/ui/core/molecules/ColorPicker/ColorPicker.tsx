'use client'

import { useRef } from 'react'
import styles from './ColorPicker.module.scss'

const EVENT_COLORS = [
  { value: '#059669', label: 'Green' },
  { value: '#d97706', label: 'Amber' },
  { value: '#dc2626', label: 'Red' },
  { value: '#7c3aed', label: 'Purple' },
  { value: '#0891b2', label: 'Cyan' },
  { value: '#be185d', label: 'Pink' },
  { value: '#0284c7', label: 'Sky' },
  { value: '#ea580c', label: 'Orange' },
  { value: '#4f46e5', label: 'Indigo' },
  { value: '#65a30d', label: 'Lime' },
  { value: '#475569', label: 'Slate' },
] as const

type ColorOption = { readonly value: string; readonly label: string }

interface ColorPickerProps {
  readonly value: string
  readonly onChange: (color: string) => void
  readonly colors?: readonly ColorOption[]
  readonly size?: number
  readonly allowCustom?: boolean
  readonly nowrap?: boolean
}

export function ColorPicker({ value, onChange, colors = EVENT_COLORS, size = 28, allowCustom = false, nowrap = false }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isPreset = colors.some((c) => c.value === value)

  return (
    <div data-component="ColorPicker" role="radiogroup" aria-label="カラー選択" className={nowrap ? styles.containerNowrap : styles.container}>
      {colors.map((c) => {
        const selected = value === c.value
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.label}
            title={c.label}
            onClick={() => onChange(c.value)}
            className={`${styles.swatch} ${selected ? styles.swatchSelected : ''}`}
            style={{ width: size, height: size, backgroundColor: c.value }}
          />
        )
      })}
      {allowCustom && (
        <button
          type="button"
          role="radio"
          aria-checked={!isPreset}
          aria-label="カスタムカラー"
          title="カスタムカラー"
          onClick={() => inputRef.current?.click()}
          className={`${styles.customSwatch} ${!isPreset ? styles.customSwatchSelected : ''}`}
          style={{
            width: size,
            height: size,
            background: !isPreset
              ? value
              : 'conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
          }}
        >
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.colorInput}
          />
        </button>
      )}
    </div>
  )
}

export { EVENT_COLORS }
export type { ColorOption }
