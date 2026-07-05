'use client'

import { useEffect } from 'react'

/**
 * 未保存変更があるとき、タブ閉じ / リロード / 別サイトへの遷移で
 * ブラウザ標準の確認ダイアログを出す（`beforeunload`）。
 *
 * `window` API のみに依存しフレームワーク非依存。SSR は effect 内アクセスで安全。
 * アプリ内 SPA 遷移（Next.js の `router.push` 等）のガードはルーティングに
 * 依存するため、このフックは扱わない（アプリ層の NavigationGuard が担う）。
 *
 * @param when 未保存変更があるとき true。false の間はリスナを張らない。
 */
export function useUnsavedGuard(when: boolean): void {
  useEffect(() => {
    if (!when) return
    const handler = (event: BeforeUnloadEvent) => {
      // 標準仕様: preventDefault + returnValue の両方でブラウザ確認を出す
      // （ブラウザ間差異のため両方を設定する）。
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])
}
