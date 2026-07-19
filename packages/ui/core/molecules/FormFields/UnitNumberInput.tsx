'use client'

import { Input } from '../Input'
import { Select } from '../Select'

import styles from './UnitNumberInput.module.scss'

export interface UnitNumberUnitOption {
  value: string
  label: string
}

export interface UnitNumberInputProps {
  /** 値は文字列のまま扱い（空文字を許容するため number 化しない）、変換は呼び出し側に委ねる。 */
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  placeholder?: string
  /** 固定単位テキスト（「分」「%」「年」等）。`unitOptions` とは排他で、こちらは結合枠のサフィックス表示。 */
  unit?: string
  /** 切替可能な単位の選択肢（「分|時間」「日|週|ヶ月」等）。指定時は単位 Select を横に出す。 */
  unitOptions?: readonly UnitNumberUnitOption[]
  unitValue?: string
  onUnitChange?: (unit: string) => void
  /** コントロール全体の最大幅 px。既定: 固定単位 160 / 選択単位 240。 */
  maxWidth?: number
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * 単位付き数値の裸コントロール。単独では UnitNumberField を使い、slider や checkbox と組む
 * 複合ウィジェットでは FieldShell の children にこれを直接置く。
 */
export function UnitNumberInput({
  value,
  onChange,
  min,
  max,
  step,
  disabled = false,
  placeholder,
  unit,
  unitOptions,
  unitValue,
  onUnitChange,
  maxWidth,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: UnitNumberInputProps) {
  if (unitOptions) {
    return (
      <div className={styles.withSelect} style={{ maxWidth: maxWidth ?? 240 }}>
        <Input
          id={id}
          type="number"
          className={styles.grow}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
        />
        <Select
          options={[...unitOptions]}
          value={unitValue}
          onChange={(v) => {
            if (v != null) onUnitChange?.(String(v))
          }}
          allowEmpty={false}
          width="w-24"
          disabled={disabled}
        />
      </div>
    )
  }

  return (
    <div
      className={[styles.box, disabled && styles.boxDisabled].filter(Boolean).join(' ')}
      style={{ maxWidth: maxWidth ?? 160 }}
    >
      <input
        id={id}
        type="number"
        className={styles.number}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      />
      <span className={styles.unit}>{unit}</span>
    </div>
  )
}
