'use client'

import { useEffect, useRef } from 'react'

/**
 * Toolbar の実高を測って wrapper に CSS 変数 `--dt-toolbar-h` (px) として書き出す。
 *
 * ヘッダはページスクロールに追従して上端へ吸着する (DataTable.module.scss の
 * `.toolbar` / `.th` の position: sticky)。黒帯ヘッダ (.th) を toolbar の真下へ
 * 正しく積むには toolbar の実高が要るが、toolbar 高は折りたたみ・チップの折り返しで
 * 動的に変わる。ResizeObserver で実測し続けて `--dt-toolbar-h` に反映する。
 *
 * toolbar が無いテーブル (検索/フィルタ/ページャ/列ピッカーすべて無効) では
 * `--dt-toolbar-h` を 0px に固定し、.th は TopBar 直下に吸着する。
 */
export function useStickyToolbarOffset<T extends HTMLElement>() {
  const wrapperRef = useRef<T>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const toolbar = wrapper.querySelector<HTMLElement>(':scope > [data-dt-toolbar]')
    if (!toolbar) {
      wrapper.style.setProperty('--dt-toolbar-h', '0px')
      return
    }

    const update = () => {
      wrapper.style.setProperty('--dt-toolbar-h', `${toolbar.offsetHeight}px`)
    }
    update()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(toolbar)
    return () => observer.disconnect()
  }, [])

  return wrapperRef
}
