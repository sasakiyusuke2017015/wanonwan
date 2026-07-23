'use client'

import { useEffect } from 'react'

// 同時に複数のオーバーレイ (Modal の上に ConfirmDialog 等) が開きうるので、
// 最後の 1 枚が閉じるまで解除しないよう参照カウントで管理する。
let lockCount = 0
let restoreOverflow = ''
let restorePaddingRight = ''

/**
 * 有効な間だけ背景 (body) のスクロールを止める。
 *
 * ページ全体がスクロールするレイアウトでは、オーバーレイ表示中にホイール操作が背景へ
 * 抜けてしまう。オーバーレイを持つ組織部品がこれを呼ぶ。
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return

    if (lockCount === 0) {
      // classic scrollbar 環境ではバーが消えた分だけ本文が右へ跳ねる。fixed の chrome は
      // 動かないためズレが不均一になるので、同じ幅の padding で埋める。
      const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
      restoreOverflow = document.body.style.overflow
      restorePaddingRight = document.body.style.paddingRight
      document.body.style.overflow = 'hidden'
      if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`
    }
    lockCount += 1

    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        document.body.style.overflow = restoreOverflow
        document.body.style.paddingRight = restorePaddingRight
      }
    }
  }, [active])
}
