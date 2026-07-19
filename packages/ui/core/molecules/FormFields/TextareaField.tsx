'use client'

import { TextArea } from '../../atoms/TextArea'
import { FieldShell, type BaseFieldProps } from '../FieldShell'

export interface TextareaFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  onBlur?: () => void
  maxLength?: number
}

/**
 * 複数行テキスト入力フィールド。ラベル/必須/説明/エラーは FieldShell が持つため、
 * TextArea 自身の label / error 機能は使わず、素の入力としてのみ利用する。
 */
export function TextareaField({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 4,
  onBlur,
  maxLength,
  ...shell
}: TextareaFieldProps) {
  return (
    <FieldShell {...shell}>
      {({ id, describedBy, invalid }) => (
        <TextArea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur ? () => onBlur() : undefined}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
      )}
    </FieldShell>
  )
}
