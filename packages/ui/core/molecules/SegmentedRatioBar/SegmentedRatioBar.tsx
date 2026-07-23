export interface RatioSegmentItem {
  key: string | number
  label: string
  /** 相対重み。合計 100 でなくてよい (実合計で正規化して幅と % を出す) */
  value: number
  /** セグメント色。未指定 / null は既定パレットから index で採番 */
  color?: string | null
}

export interface SegmentedRatioBarProps {
  segments: readonly RatioSegmentItem[]
  /** バーの高さ (px, default: 10) */
  height?: number
  className?: string
}

// カテゴリ色未設定時のフォールバックパレット (隣接が同系色にならない並び)
const FALLBACK_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#0ea5e9',
  '#16a34a',
  '#f59e0b',
  '#db2777',
  '#0d9488',
  '#64748b',
] as const

/**
 * SegmentedRatioBar — 構成比の読み取り専用ミニバー。
 *
 * 出題比率などの「複数カテゴリの重み配分」を 1 本の積み上げバーで表示する。
 * 各セグメントは実合計で正規化した比率幅になり、hover (title) と aria-label で
 * 「ラベル N%」を提示する。編集 (境界ドラッグ等) は持たない — 編集は
 * ExamCategoryComposer が担い、本コンポーネントは一覧セル等の省スペース表示用。
 * 正の重みが 1 つも無ければ何も描画しない (呼び出し側でフォールバック表示する)。
 */
export function SegmentedRatioBar({ segments, height = 10, className }: SegmentedRatioBarProps) {
  const positive = segments.filter((s) => s.value > 0)
  const total = positive.reduce((sum, s) => sum + s.value, 0)
  if (total <= 0) return null

  const pct = (v: number) => Math.round((v / total) * 100)

  return (
    <div
      data-component="segmented-ratio-bar"
      role="img"
      aria-label={positive.map((s) => `${s.label} ${pct(s.value)}%`).join(' / ')}
      className={`flex w-full overflow-hidden rounded-full ${className ?? ''}`}
      style={{ height }}
    >
      {positive.map((s, i) => (
        <div
          key={s.key}
          title={`${s.label} ${pct(s.value)}%`}
          className="min-w-[3px]"
          style={{
            flexGrow: s.value,
            flexBasis: 0,
            backgroundColor: s.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          }}
        />
      ))}
    </div>
  )
}

export default SegmentedRatioBar
