'use client'

import { FieldShell, type BaseFieldProps } from '../FieldShell'

import styles from './ToggleChipsField.module.scss'

export interface ToggleChipOption {
  value: number
  label: string
  /** 未選択時にラベル左へ出す色ドット（タグの色分け表示用）。 */
  color?: string | null
}

export interface ToggleChipsFieldProps extends BaseFieldProps {
  options: readonly ToggleChipOption[]
  value: readonly number[]
  onChange: (next: number[]) => void
  /** 選択中チップの左にチェックマークを出す（カテゴリ選択の見た目）。 */
  checkIcon?: boolean
  disabled?: boolean
}

/**
 * トグルチップの複数選択フィールド。タグ・カテゴリのような「候補から複数選ぶ」用途の共通形。
 * 単一選択は `PillSelect`（molecules）を使う。
 */
export function ToggleChipsField({
  options,
  value,
  onChange,
  checkIcon = false,
  disabled = false,
  ...shell
}: ToggleChipsFieldProps) {
  const toggle = (v: number) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  return (
    <FieldShell {...shell}>
      {({ id, describedBy }) => (
        <div id={id} role="group" className={styles.chips} aria-describedby={describedBy}>
          {options.map((option) => {
            const checked = value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={checked}
                disabled={disabled}
                className={[styles.chip, checked && styles.chipChecked].filter(Boolean).join(' ')}
                onClick={() => toggle(option.value)}
              >
                {checkIcon && checked && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                )}
                {option.color && !checked && (
                  <span
                    data-chip-dot
                    className={styles.dot}
                    style={{ backgroundColor: option.color }}
                    aria-hidden
                  />
                )}
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </FieldShell>
  )
}
