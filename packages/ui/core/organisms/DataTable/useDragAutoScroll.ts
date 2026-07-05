'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { DragEvent as ReactDragEvent, RefObject } from 'react'

interface AutoScrollOptions {
  /** 上下端から何 px 以内でスクロールを始めるか (default: 36) */
  edgeSize?: number
  /** 端ちょうどでの 1 フレームあたりの最大スクロール量 px (default: 12) */
  maxSpeed?: number
}

/**
 * ポインタ Y 座標とコンテナ矩形から、1 フレームあたりのスクロール量 (px) を返す純関数。
 * 負 = 上スクロール / 正 = 下スクロール / 0 = スクロールなし。端に近いほど速くなる。
 */
export function computeAutoScrollSpeed(
  pointerY: number,
  rect: { top: number; bottom: number },
  { edgeSize = 36, maxSpeed = 12 }: AutoScrollOptions = {},
): number {
  const topDist = pointerY - rect.top
  const bottomDist = rect.bottom - pointerY

  if (topDist < edgeSize) {
    const ratio = Math.min(1, Math.max(0, (edgeSize - topDist) / edgeSize))
    return -Math.ceil(ratio * maxSpeed)
  }
  if (bottomDist < edgeSize) {
    const ratio = Math.min(1, Math.max(0, (edgeSize - bottomDist) / edgeSize))
    return Math.ceil(ratio * maxSpeed)
  }
  return 0
}

/**
 * ネイティブ HTML5 D&D 中はブラウザがスクロールコンテナを自動スクロールしないため、
 * ドラッグ中のポインタが上下端付近に来たら scrollTop を動かしてリストを送る。
 *
 * - `onDragOver` をスクロールコンテナ (ref で渡した要素) の dragover に繋ぐ
 * - ドラッグ終了 (drop / dragend) で `stop()` を呼ぶ
 *
 * ポインタを端で止めても dragover は発火しないため、rAF ループで継続スクロールする。
 */
export function useDragAutoScroll(
  ref: RefObject<HTMLElement | null>,
  options: AutoScrollOptions = {},
) {
  const { edgeSize, maxSpeed } = options
  const speedRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    speedRef.current = 0
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    const el = ref.current
    if (el && speedRef.current !== 0) {
      el.scrollTop += speedRef.current
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null
    }
  }, [ref])

  const onDragOver = useCallback(
    (e: ReactDragEvent | DragEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      speedRef.current = computeAutoScrollSpeed(e.clientY, rect, { edgeSize, maxSpeed })
      if (speedRef.current !== 0 && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick)
      }
    },
    [ref, edgeSize, maxSpeed, tick],
  )

  // unmount 時に走っている rAF を止める。
  useEffect(() => stop, [stop])

  return { onDragOver, stop }
}
