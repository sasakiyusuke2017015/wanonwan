/**
 * マスタの「イメージカラー」(任意 hex) の判定と可読文字色の導出。
 *
 * CSV import の coerce は空セルを NULL でなく '' にするため、「色あり」判定は
 * null チェックではなく本 util の非空 hex 判定に一本化する (誤検知防止)。
 */

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** 非空の #RGB / #RRGGBB hex か。表示側の「色バッジにするか」の唯一の判定に使う。 */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_RE.test(value.trim())
}

/**
 * 背景 hex に対して可読な文字色 (濃背景 → 白 / 淡背景 → ダークグレー) を返す。
 * YIQ 輝度による近似 (a11y のためのコントラスト自動導出)。
 */
export function hexReadableTextColor(hex: string): '#ffffff' | '#1f2937' {
  // 非 hex は parseInt が NaN になり、比較が常に false で白字に倒れてしまう。
  // 淡背景を仮定したダークグレーへ明示的にフォールバックする。
  if (!isHexColor(hex)) return '#1f2937'
  const h = hex.trim().slice(1)
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150 ? '#1f2937' : '#ffffff'
}
