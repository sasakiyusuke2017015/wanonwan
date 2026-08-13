import type { FilterDef } from './types'

/**
 * filter に有効な絞り込み値が入っているか (タイプ別に「未適用」を判定する)。
 * Toolbar のチップ要約 / 入力の表示判定と、client / server の「絞り込み中」表示で共有する。
 */
export function filterHasValue(f: FilterDef): boolean {
  switch (f.type) {
    case 'text':
    case 'date':
      return f.value.trim() !== ''
    case 'numberRange':
      return f.value !== null
    default:
      if (f.multiple) return f.value.length > 0
      return f.value !== null && f.value !== undefined && f.value !== ''
  }
}
