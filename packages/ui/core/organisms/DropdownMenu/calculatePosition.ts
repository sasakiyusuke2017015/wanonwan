/**
 * DropdownMenu の menu 配置座標を計算する純粋関数。
 *
 * trigger と menu のサイズ・位置から `position: fixed` で使う `top` / `left`
 * を返す。`viewport` 引数を渡したときは、viewport から `viewportMargin` の
 * 距離まで menu が寄らないように `top` / `left` を clamp する。
 * viewport を渡さなければ従来挙動 (clamp 無し) のまま。
 *
 * placement に応じた自動フリップ (例: 下に置きたいが下にスペースが無いから
 * 上に逃がす) は本関数の責務外。
 */

export type DropdownMenuPlacement =
  | 'bottom-end'
  | 'bottom-start'
  | 'top-end'
  | 'top-start'
  | 'right-start'
  | 'right-end'
  | 'left-start'
  | 'left-end'

export interface TriggerRect {
  top: number
  left: number
  right: number
  bottom: number
}

export interface MenuSize {
  width: number
  height: number
}

export interface Position {
  top: number
  left: number
}

export interface ViewportSize {
  width: number
  height: number
}

/**
 * crossOffset は placement の主軸と直交する方向へのずらし量 (px)。
 *   - 縦配置 (top-* / bottom-*): 横 (left) 方向に正で右へ
 *   - 横配置 (left-* / right-*): 縦 (top)  方向に正で下へ
 * trigger より広い menu を主軸の整列だけでは合わせきれないとき (sidebar に
 * 食い込ませる等) に使う。
 */
function rawPosition(
  trigger: TriggerRect,
  menu: MenuSize,
  placement: DropdownMenuPlacement,
  offset: number,
  crossOffset: number,
): Position {
  switch (placement) {
    case 'bottom-start':
      return { top: trigger.bottom + offset, left: trigger.left + crossOffset }
    case 'bottom-end':
      return { top: trigger.bottom + offset, left: trigger.right - menu.width + crossOffset }
    case 'top-start':
      return { top: trigger.top - offset - menu.height, left: trigger.left + crossOffset }
    case 'top-end':
      return { top: trigger.top - offset - menu.height, left: trigger.right - menu.width + crossOffset }
    case 'right-start':
      return { top: trigger.top + crossOffset, left: trigger.right + offset }
    case 'right-end':
      return { top: trigger.bottom - menu.height + crossOffset, left: trigger.right + offset }
    case 'left-start':
      return { top: trigger.top + crossOffset, left: trigger.left - offset - menu.width }
    case 'left-end':
      return { top: trigger.bottom - menu.height + crossOffset, left: trigger.left - offset - menu.width }
  }
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  if (value < min) return min
  if (value > max) return max
  return value
}

export function calculateDropdownPosition(
  trigger: TriggerRect,
  menu: MenuSize,
  placement: DropdownMenuPlacement,
  offset: number,
  viewport?: ViewportSize,
  viewportMargin: number = 0,
  crossOffset: number = 0,
  avoidTriggerOverlap: boolean = false,
): Position {
  const pos = rawPosition(trigger, menu, placement, offset, crossOffset)
  if (!viewport) return pos

  const maxLeft = viewport.width - menu.width - viewportMargin
  const maxTop = viewport.height - menu.height - viewportMargin
  let top = clamp(pos.top, viewportMargin, maxTop)
  let left = clamp(pos.left, viewportMargin, maxLeft)

  // avoidTriggerOverlap: viewport clamp が menu を主軸方向に押し戻して trigger に
  // 被せてしまうのを防ぐ。例: 画面下端の trigger から top-* で上開きしたとき、menu が
  // 縦に長いと理想位置が画面上端をはみ出し、min クランプで下に戻されて trigger に重なる。
  // この場合「trigger を跨がない側」へ寄せ直し、viewport 端を越えてはみ出す方を許容する。
  // (default false。下開きで画面に収めることを優先したい通常の dropdown は既存挙動のまま)
  if (avoidTriggerOverlap) {
    if (placement.startsWith('top')) {
      top = Math.min(top, trigger.top - offset - menu.height)
    } else if (placement.startsWith('bottom')) {
      top = Math.max(top, trigger.bottom + offset)
    } else if (placement.startsWith('left')) {
      left = Math.min(left, trigger.left - offset - menu.width)
    } else if (placement.startsWith('right')) {
      left = Math.max(left, trigger.right + offset)
    }
  }
  return { top, left }
}

/**
 * trigger と menu 位置から、「trigger 中心が menu のどこに位置するか」を
 * `transform-origin` の値として返す純粋関数。`expandFromTrigger` variant が
 * 「押した場所から拡大する」見た目になるように使う。
 *
 * 返り値は `${x}px ${y}px` 形式で、CSS の `transform-origin` 文字列にそのまま
 * 渡せる。値は menu のローカル座標 (menu の左上が 0,0) で、menu の枠外に
 * なってもよい (CSS は menu 外の transform-origin も受け入れる)。
 */
export function transformOriginFromTrigger(trigger: TriggerRect, menuPos: Position): string {
  const triggerCenterX = (trigger.left + trigger.right) / 2
  const triggerCenterY = (trigger.top + trigger.bottom) / 2
  const originX = triggerCenterX - menuPos.left
  const originY = triggerCenterY - menuPos.top
  return `${originX}px ${originY}px`
}
