'use client'

import { FieldShell, type BaseFieldProps } from '../FieldShell'
import { UnitNumberInput, type UnitNumberInputProps } from './UnitNumberInput'

export interface UnitNumberFieldProps
  extends BaseFieldProps,
    Omit<UnitNumberInputProps, 'id' | 'aria-describedby' | 'aria-invalid'> {}

/**
 * 単位付き数値フィールド。数値 input の右に固定単位（「分」「%」「年」等）を結合するか、
 * 単位 Select（「分|時間」等）を横に並べて 1 つのコントロールとして見せる。
 */
export function UnitNumberField({
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  placeholder,
  unit,
  unitOptions,
  unitValue,
  onUnitChange,
  maxWidth,
  ...shell
}: UnitNumberFieldProps) {
  return (
    <FieldShell {...shell}>
      {({ id, describedBy, invalid }) => (
        <UnitNumberInput
          id={id}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          unit={unit}
          unitOptions={unitOptions}
          unitValue={unitValue}
          onUnitChange={onUnitChange}
          maxWidth={maxWidth}
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
      )}
    </FieldShell>
  )
}
