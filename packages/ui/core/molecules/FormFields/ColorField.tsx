'use client'

import { ColorPicker } from '../ColorPicker'
import { FieldShell, type BaseFieldProps } from '../FieldShell'
import { Input } from '../Input'

import styles from './ColorField.module.scss'

export interface ColorFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * 色選択フィールド。プリセットのスウォッチ（ColorPicker）と hex 直接入力を横並びにし、
 * どちらで変更しても同じ hex 文字列を返す。カテゴリ色・タグ色などの設定に使う。
 */
export function ColorField({ value, onChange, disabled, ...shell }: ColorFieldProps) {
  return (
    <FieldShell {...shell}>
      {({ id, describedBy, invalid }) => (
        <div className={styles.row}>
          <ColorPicker value={value} onChange={onChange} allowCustom />
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#3B82F6"
            disabled={disabled}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={styles.hex}
          />
        </div>
      )}
    </FieldShell>
  )
}
