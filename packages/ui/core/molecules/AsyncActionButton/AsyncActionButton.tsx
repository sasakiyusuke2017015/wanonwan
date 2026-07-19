'use client'

import { useState, type ReactNode } from 'react'
import { Button } from '../Button'

export interface AsyncActionButtonProps {
  /** 非同期アクション。Promise<void> で完了。例外は内部で握りつぶさず捕まえる */
  onAction: () => Promise<unknown>
  /** ボタン文言（通常時） */
  children: ReactNode
  /** ローディング中文言。未指定なら通常文言のまま disabled になる */
  pendingLabel?: ReactNode
  /** 失敗時に呼ばれる。指定なければデフォルトで window.alert は出さず投げ直す */
  onError?: (err: unknown) => void
  /** その他は Button にスルーで渡す */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'default' | 'success' | 'nav' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  /** 外部から強制的に disabled したい場合 */
  disabled?: boolean
}

/**
 * 非同期アクションをトリガーするボタン。
 *   - クリック中は自動的に loading 状態 (disabled + pendingLabel)
 *   - 完了/失敗どちらも finally で解除
 *   - 業務ロジック(fetch / router) は呼び出し側で onAction に書く（catalog に
 *     アプリ固有依存を持ち込まない原則を守る）。
 *
 * 利用例:
 *   <AsyncActionButton
 *     onAction={async () => {
 *       await fetch('/api/v1/courses/1/enroll', { method: 'POST' })
 *       router.refresh()
 *     }}
 *     pendingLabel="登録中…"
 *   >
 *     受講開始
 *   </AsyncActionButton>
 */
export function AsyncActionButton({
  onAction,
  children,
  pendingLabel,
  onError,
  disabled,
  ...rest
}: AsyncActionButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (loading) return
    setLoading(true)
    try {
      await onAction()
    } catch (err) {
      if (onError) onError(err)
      else throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handle} loading={loading} disabled={disabled || loading} {...rest}>
      {loading && pendingLabel ? pendingLabel : children}
    </Button>
  )
}

export default AsyncActionButton
