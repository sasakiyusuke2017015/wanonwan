'use client'

import { FieldShell, type BaseFieldProps } from '../FieldShell'
import { Input } from '../Input'

export interface NumberFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  onBlur?: () => void
}

/**
 * 数値入力フィールド。値は文字列のまま扱い（空文字を許容するため number 化しない）、
 * 変換は呼び出し側の送信ロジックに委ねる。
 */
export function NumberField({
  value,
  onChange,
  placeholder,
  disabled,
  min,
  max,
  step,
  onBlur,
  ...shell
}: NumberFieldProps) {
  return (
    <FieldShell {...shell}>
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur ? () => onBlur() : undefined}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
      )}
    </FieldShell>
  )
}
