'use client'

import { useState } from 'react'

import { Icon } from '../../atoms/Icon'
import { Tooltip } from '../../atoms/Tooltip'
import { isModifiedClick } from '../../utils'
import { ConfirmDialog } from '../ConfirmDialog'
import type { RowActionDef } from './types'

function iconBtnClassName(danger?: boolean, disabled?: boolean): string {
  const base = 'grid h-8 w-8 place-items-center rounded-md border border-transparent transition-colors'
  if (disabled) return `${base} cursor-not-allowed text-muted-foreground/40`
  return `${base} ${
    danger
      ? 'text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600'
      : 'text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
  }`
}

function IconBtn({
  icon,
  label,
  danger,
  onClick,
  href,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
  /**
   * 渡すと `<a href>` で描画し、Ctrl/⌘/中クリックでの別タブ等を有効化する。
   * 通常クリックは preventDefault して `onClick` (= app の SPA 遷移) を呼ぶ。
   */
  href?: string
  /** 押下不可。href より優先し、`<button disabled>` として描画する。 */
  disabled?: boolean
}) {
  // 機能名は native title でなく Tooltip atom で出す (見た目統一 + focus でも表示)。
  // 上に出すと 1 行目でヘッダー行に被るため、行の高さ内に収まる left (アイコン左横)。
  // disabled でも wrapper の :hover は効くため、削除不可の理由 tooltip も出る。
  if (href && !disabled) {
    return (
      <Tooltip content={label} position="left">
        <a
          href={href}
          aria-label={label}
          onClick={(e) => {
            if (isModifiedClick(e)) return // 別タブ等はブラウザに委ねる
            e.preventDefault()
            onClick()
          }}
          className={iconBtnClassName(danger)}
        >
          {icon}
        </a>
      </Tooltip>
    )
  }
  return (
    <Tooltip content={label} position="left">
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        className={iconBtnClassName(danger, disabled)}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

/**
 * `default: true` の row action から「行クリックの既定ハンドラ」を導出する。
 * 該当が無ければ undefined (= その行はクリック不可)。delete は対象外 (誤削除防止)。
 */
export function resolveDefaultRowActionHandler<TRow>(
  actions?: RowActionDef<TRow>[],
): ((row: TRow) => void) | undefined {
  const def = actions?.find(
    (a): a is Exclude<RowActionDef<TRow>, { type: 'delete' } | { type: 'toggle' }> =>
      a.type !== 'delete' && a.type !== 'toggle' && a.default === true,
  )
  return def ? (row: TRow) => def.onClick(row) : undefined
}

export function RowActionsCell<TRow>({
  row,
  actions,
}: {
  row: TRow
  actions: RowActionDef<TRow>[]
}) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const deleteAction = actions.find(
    (a): a is Extract<RowActionDef<TRow>, { type: 'delete' }> => a.type === 'delete',
  )

  const handleDeleteConfirm = async () => {
    if (!deleteAction) return
    setBusy(true)
    await Promise.resolve(deleteAction.onDelete(row))
    setBusy(false)
    setDeleteOpen(false)
  }

  return (
    <>
      <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
        {actions.map((action, i) => {
          if (action.type === 'detail')
            return (
              <IconBtn
                key="detail"
                icon={<Icon name="eye" size={15} />}
                label={action.label ?? '詳細を見る'}
                onClick={() => action.onClick(row)}
                href={action.href?.(row)}
              />
            )
          if (action.type === 'edit')
            return (
              <IconBtn
                key="edit"
                icon={<Icon name="pencil" size={15} />}
                label={action.label ?? '編集'}
                onClick={() => action.onClick(row)}
                href={action.href?.(row)}
              />
            )
          if (action.type === 'duplicate')
            return (
              <IconBtn
                key="duplicate"
                icon={<Icon name="copy" size={15} />}
                label={action.label ?? '複製'}
                onClick={() => action.onClick(row)}
              />
            )
          if (action.type === 'delete') {
            const disabled = action.disabled?.(row) ?? false
            const reason = disabled ? action.disabledReason?.(row) : undefined
            return (
              <IconBtn
                key="delete"
                icon={<Icon name="trash" size={15} />}
                label={reason ?? action.label ?? '削除'}
                danger={!disabled}
                disabled={disabled}
                onClick={() => setDeleteOpen(true)}
              />
            )
          }
          // toggle — 有効/無効の状態に応じて icon / label / danger を catalog 側で出し分ける。
          if (action.type === 'toggle') {
            const isActive = action.active(row)
            return (
              <IconBtn
                key="toggle"
                icon={
                  isActive
                    ? (action.activeIcon ?? <Icon name="ban" size={15} />)
                    : (action.inactiveIcon ?? <Icon name="check-circle" size={15} />)
                }
                label={
                  isActive ? (action.activeLabel ?? '無効化') : (action.inactiveLabel ?? '有効化')
                }
                danger={isActive}
                onClick={() => action.onToggle(row)}
              />
            )
          }
          // custom — 固定の icon / label / danger。
          return (
            <IconBtn
              key={`custom-${i}`}
              icon={action.icon}
              label={action.label}
              danger={action.danger}
              onClick={() => action.onClick(row)}
              href={action.href?.(row)}
            />
          )
        })}
      </div>

      {deleteAction && deleteOpen && (
        <ConfirmDialog
          isOpen
          title={deleteAction.confirmTitle ?? '削除'}
          message={
            deleteAction.confirmMessage
              ? deleteAction.confirmMessage(row)
              : '削除します。この操作は取り消せません。'
          }
          confirmText={busy ? '削除中…' : '削除する'}
          cancelText="キャンセル"
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
    </>
  )
}
