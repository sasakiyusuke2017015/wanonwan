'use client'

import { ReactNode, useId } from 'react'

import { Collapse } from '../Collapse'

import styles from './FieldShell.module.scss'

/**
 * フォームフィールド共通シェル。ラベル + 必須/任意バッジ + 説明 + エラーを 1 箇所に集約し、
 * どの入力種別（Text / Number / Select / Color / Textarea）でも見た目と a11y 配線を統一する。
 *
 * 入力コントロール本体は render-prop の children で受け取り、a11y に必要な id を配る:
 * - `id`: ラベルの `htmlFor` と対応する input の `id`
 * - `describedBy`: 説明・エラーの id を連結した `aria-describedby`
 * - `invalid`: error があるとき `aria-invalid` に渡す真偽値
 *
 * 「見た目は catalog の SCSS に持つ」規約に従い、装飾は FieldShell.module.scss のみで表現する。
 */
export interface FieldShellRenderProps {
  id: string
  describedBy: string | undefined
  invalid: boolean
}

/**
 * 型付きフィールド（TextField / NumberField / SelectField / ColorField / TextareaField）が
 * 共通で受け取る、FieldShell に素通しするプレゼンテーション系 props。各フィールドはこれに
 * `value` / `onChange` など入力種別固有の props を足す。
 */
export interface BaseFieldProps {
  /** ラベルと input を結ぶ id。未指定なら useId で自動採番。 */
  id?: string
  label?: string
  /** true で「必須」バッジ、false で「任意」バッジ（`showOptionalBadge=false` なら任意は出さない）。 */
  required?: boolean
  /** 任意フィールドで「任意」バッジを出すか。既定 true。 */
  showOptionalBadge?: boolean
  description?: string
  error?: string
  className?: string
}

export interface FieldShellProps extends BaseFieldProps {
  children: (props: FieldShellRenderProps) => ReactNode
}

export function FieldShell({
  id,
  label,
  required = false,
  showOptionalBadge = true,
  description,
  error,
  className,
  children,
}: FieldShellProps) {
  const autoId = useId()
  const fieldId = id ?? `field-${autoId}`
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  const rootClassName = [styles.field, className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName} data-component="field-shell">
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          <span className={styles.labelText}>{label}</span>
          {required ? (
            <span className={styles.badgeRequired}>必須</span>
          ) : showOptionalBadge ? (
            <span className={styles.badgeOptional}>任意</span>
          ) : null}
        </label>
      )}

      <div className={styles.control}>
        {children({ id: fieldId, describedBy, invalid: Boolean(error) })}
      </div>

      {/* 説明はコントロールの下に置く。ラベルと入力欄の間に挟むと、説明の有無で
          横並び（FormGrid）の入力欄の高さ位置が揃わなくなるため。 */}
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}

      {/* エラーは collapse アニメで出し入れする（既存フォームの体験に合わせる）。
          Collapse は open=false でも children を DOM に残す（高さ 0）ため、error が無いときは
          role/id を付けない（空の alert を残さない・aria-describedby も張らない）。中身の高さは
          自動実測なので、エラー文が複数行でもクリップしない（旧 maxHeight=40 の制約を解消）。 */}
      <Collapse open={Boolean(error)}>
        <p
          id={error ? errorId : undefined}
          className={styles.error}
          role={error ? 'alert' : undefined}
        >
          {error}
        </p>
      </Collapse>
    </div>
  )
}
