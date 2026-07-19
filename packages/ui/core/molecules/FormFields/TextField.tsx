'use client'

import { FieldShell, type BaseFieldProps } from '../FieldShell'
import { Input } from '../Input'

export interface TextFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** blur 時の検証などに使う（入力欄からフォーカスが外れたとき）。 */
  onBlur?: () => void
  /** input の type（email / tel など）。既定は text。 */
  type?: string
  maxLength?: number
}

/**
 * ラベル + 必須/任意 + 説明 + エラーを備えた 1 行テキスト入力。
 * onChange は event ではなく生の文字列値を返し、フォーム state (Record<string,string>) と直結できる。
 */
export function TextField({
  value,
  onChange,
  placeholder,
  disabled,
  onBlur,
  type = 'text',
  maxLength,
  ...shell
}: TextFieldProps) {
  return (
    <FieldShell {...shell}>
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur ? () => onBlur() : undefined}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
      )}
    </FieldShell>
  )
}
