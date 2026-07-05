'use client'

import { useState } from 'react'

import { Icon } from '../../atoms/Icon'
import { isModifiedClick } from '../../utils'
import { ConfirmDialog } from '../ConfirmDialog'
import type { RowActionDef } from './types'

function iconBtnClassName(danger?: boolean): string {
  return `grid h-8 w-8 place-items-center rounded-md border border-transparent transition-colors ${
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
}) {
  if (href) {
    return (
      <a
        href={href}
        title={label}
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
    )
  }
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={iconBtnClassName(danger)}
    >
      {icon}
    </button>
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
          if (action.type === 'delete')
            return (
              <IconBtn
                key="delete"
                icon={<Icon name="trash" size={15} />}
                label={action.label ?? '削除'}
                danger
                onClick={() => setDeleteOpen(true)}
              />
            )
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
