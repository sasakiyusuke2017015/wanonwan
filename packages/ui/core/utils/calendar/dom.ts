/**
 * 実際に stuck しているヘッダー群の下端（コンテンツ表示開始位置）を返す
 * viewport 上部 1/3 以内にあるヘッダーのみ対象（それ以下は未 stuck）
 */
export function getStickyBottom(gap = 4): number {
  const els = document.querySelectorAll('header, [data-sticky-header]')
  const threshold = window.innerHeight / 3
  let bottom = 0
  for (const el of Array.from(els)) {
    const b = el.getBoundingClientRect().bottom
    if (b > bottom && b < threshold) bottom = b
  }
  return bottom + gap
}
