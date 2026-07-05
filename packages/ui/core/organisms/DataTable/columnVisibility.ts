import type { Column } from './types'

/**
 * column picker の表示制御を client / server 両モードで共有するための純関数群。
 *
 * `visibleColumns` は **順序が有効** な「表示中の列 key 配列」。
 * - 配列の並び順がそのまま表の列順になる（ドラッグ並べ替えで更新される）
 * - 含まれる key が表示対象。含まれない toggleable 列は非表示
 *
 * 表示判定のルール:
 * - `hideable === false` の列（ロック列）は `visibleColumns` の内容に関わらず **常時表示**
 *   - 先頭側のロック列（最初の toggleable 列より前）は先頭に固定
 *   - それ以外のロック列（末尾の操作列など）は末尾に固定
 * - `visibleColumns` 未指定なら `defaultHidden` を除いた全列を元の順で表示
 */

/** defaultHidden を除いた、初期表示 column key の配列（元の列順）。 */
export function defaultVisibleKeys<TRow>(columns: Column<TRow>[]): string[] {
  return columns.filter((c) => !c.defaultHidden).map((c) => c.key)
}

/** toggleable（ロックでない）列か。 */
function isToggleable<TRow>(col: Column<TRow>): boolean {
  return col.hideable !== false
}

/**
 * 実際に描画する column を、`visibleColumns` の並び順で返す。
 *
 * `visibleColumns` は表示する列 key を表示順で並べた配列で、**ロック列 (hideable=false) の
 * 位置も含めて** そのまま採用する（ピッカーで全列を並べ替えられるため）。
 *
 * 後方互換: 旧ピッカーは toggleable のみ保存していたため、保存値にロック列キーが無いことが
 * ある。`visibleColumns` に**欠けているロック列だけ**自然位置で補完する:
 * - 最初の toggleable 列より前にある（先頭側）ロック列 → 先頭へ
 * - それ以外（末尾の操作列など）→ 末尾へ
 * これにより、ロック列キーを持たない既存 state でも従来どおり先頭/末尾に表示される。
 */
export function resolveVisibleColumns<TRow>(
  columns: Column<TRow>[],
  visibleColumns: string[] | undefined,
): Column<TRow>[] {
  if (!visibleColumns) return columns.filter((c) => !c.defaultHidden)

  const byKey = new Map(columns.map((c) => [c.key, c] as const))
  const added = new Set<string>()
  const middle: Column<TRow>[] = []

  // 1) visibleColumns の並び順をそのまま採用（ロック列の位置も honor）
  for (const key of visibleColumns) {
    const col = byKey.get(key)
    if (!col || added.has(key)) continue
    middle.push(col)
    added.add(key)
  }

  // 2) 欠けているロック列を自然位置で補完（先頭側 → 先頭 / それ以外 → 末尾）
  const frontMissing: Column<TRow>[] = []
  const endMissing: Column<TRow>[] = []
  let seenToggleable = false
  for (const col of columns) {
    if (isToggleable(col)) {
      seenToggleable = true
      continue
    }
    if (added.has(col.key)) continue
    ;(seenToggleable ? endMissing : frontMissing).push(col)
  }

  return [...frontMissing, ...middle, ...endMissing]
}

/**
 * picker で `key` をトグルした後の visibleColumns 配列を返す。
 * `hideable === false`（ロック列）はトグル不可（現状をそのまま返す）。
 * 表示 ON 時は末尾に追加（並べ替えは reorder で行う）。
 */
export function toggleVisibleColumn<TRow>(
  columns: Column<TRow>[],
  visibleColumns: string[] | undefined,
  key: string,
): string[] {
  const current = visibleColumns ?? defaultVisibleKeys(columns)
  const target = columns.find((c) => c.key === key)
  if (target?.hideable === false) return current
  return current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
}

/**
 * 表示中 toggleable 列の「表示順リスト」を、`fromKey` を `toKey` の位置へ移動して返す。
 * picker のドラッグ並べ替えから呼ぶ。両 key が含まれないときは入力をそのまま返す。
 */
export function moveColumnKey(order: string[], fromKey: string, toKey: string): string[] {
  if (fromKey === toKey) return order
  const from = order.indexOf(fromKey)
  const to = order.indexOf(toKey)
  if (from < 0 || to < 0) return order
  const next = [...order]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/**
 * ドラッグ並べ替え中、over 中の項目のどちら側に挿入インジケータ (線) を出すかを返す。
 * `moveColumnKey` の落ち先 (下方向ドラッグ = 対象の下 / 上方向 = 対象の上) と一致させ、
 * 「線が出ている位置」と「実際に入れ替わる位置」のズレを防ぐ。
 * - `'bottom'` … 対象の下端に線 (下方向ドラッグ)
 * - `'top'` … 対象の上端に線 (上方向ドラッグ)
 * - `null` … 線を出さない (over が drag 自身 / key 不明)
 */
export function dropIndicatorSide(
  order: string[],
  draggingKey: string | null,
  overKey: string,
): 'top' | 'bottom' | null {
  if (!draggingKey || draggingKey === overKey) return null
  const from = order.indexOf(draggingKey)
  const to = order.indexOf(overKey)
  if (from < 0 || to < 0) return null
  return from < to ? 'bottom' : 'top'
}
