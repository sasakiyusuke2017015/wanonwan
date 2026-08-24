/**
 * VRT（visual regression test）撮影モードの判定。
 *
 * 撮影層が `window.__VRT_CAPTURE__ = true` を注入した状態では、
 * 時間に依存するアニメーション（JS スプリング / 無限ループ）を
 * 最終状態へ即座に確定させ、スクリーンショットを決定的にする。
 *
 * この分岐が無いと、framer-motion の `useSpring` のように
 * `document.getAnimations()` に現れない JS 駆動アニメーションを
 * 撮影層（CSS 無効化・WAAPI finish）から静止させる手段が無い。
 */
export function isCaptureMode(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    (globalThis as { __VRT_CAPTURE__?: boolean }).__VRT_CAPTURE__ === true
  )
}
