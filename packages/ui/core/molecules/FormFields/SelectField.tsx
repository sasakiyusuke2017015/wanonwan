'use client'

import { FieldShell, type BaseFieldProps } from '../FieldShell'
import { Select } from '../Select'

export interface SelectFieldOption {
  value: string | number
  label: string
}

export interface SelectFieldProps extends BaseFieldProps {
  options: SelectFieldOption[]
  value: string | number | undefined
  onChange: (value: string | number | undefined) => void
  placeholder?: string
  disabled?: boolean
  /** 未選択（空）オプションのラベル。例: '未設定'。未指定なら placeholder を流用。 */
  emptyLabel?: string
}

/**
 * 単一選択のセレクトフィールド。会社選択など「選択肢マスタから選ぶ」用途の共通形。
 * 必須のときは未選択（空）オプションを出さない。幅はフォームに合わせて全幅にする。
 */
export function SelectField({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  emptyLabel,
  ...shell
}: SelectFieldProps) {
  return (
    <FieldShell required={required} {...shell}>
      {({ id, describedBy, invalid }) => (
        <Select
          id={id}
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? '選択してください'}
          emptyLabel={emptyLabel}
          disabled={disabled}
          allowEmpty={!required}
          width="w-full"
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
      )}
    </FieldShell>
  )
}
