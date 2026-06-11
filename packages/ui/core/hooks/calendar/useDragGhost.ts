/**
 * useDragGhost - ドラッグ中のゴースト要素をカーソルに追従させるフック
 *
 * rAF + DOM 直接操作で React の再レンダリングを回避する。
 * CalendarDragOverlay / MonthDragOverlay で共通使用。
 */
import { useEffect, useRef } from 'react'

interface UseDragGhostOptions {
  /** 初期ポインター座標 */
  initialX: number
  initialY: number
  /** Y軸オフセット（デフォルト: -16） */
  offsetY?: number
  /** 有効かどうか */
  enabled?: boolean
}

export function useDragGhost({
  initialX,
  initialY,
  offsetY = -16,
  enabled = true,
}: UseDragGhostOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  // 初期位置の設定
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    el.style.transform = `translate(${initialX}px, ${initialY + offsetY}px)`
  }, []) // intentionally run once for initial position

  // ポインター追従
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const handlePointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        el.style.transform = `translate(${e.clientX}px, ${e.clientY + offsetY}px)`
      })
    }

    document.addEventListener('pointermove', handlePointerMove)
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, offsetY])

  return ref
}
