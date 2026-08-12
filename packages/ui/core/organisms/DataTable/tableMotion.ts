import type { Variants } from 'framer-motion'

/**
 * DataTable の行/列 表示・非表示アニメーション (framer-motion) のバリアント定義。
 * 手本は `Animated` の `category="tableRow"` (slideDown / fadeIn / slideLeft)。
 * duration / easing は constants/animations.ts の TABLE_ROW 系に概ね揃える。
 */

export type TableAnimationVariant = 'slideDown' | 'fadeIn' | 'slideLeft'

/** cubic-bezier(0.4, 0, 0.2, 1) = ANIMATION_EASING.SMOOTH */
const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const

/** 列セルの登場/退場 (秒)。 */
const ENTER_SEC = 0.3
const EXIT_SEC = 0.18

/** cubic-bezier(0.4, 0, 0.2, 1) を WAAPI 用文字列で。 */
const FLIP_EASING_CSS = 'cubic-bezier(0.4, 0, 0.2, 1)'

/** 行の登場アニメ (WAAPI) の所要時間 / スタガー (ms)。 */
const ROW_ENTER_MS = 300
const ROW_STAGGER_MS = 30
/** スタガー遅延の上限 index。これ以上は遅延を増やさない (末尾行が長く待たない)。 */
const MAX_STAGGER_INDEX = 12

/**
 * 行 (tr) の登場アニメ (WAAPI `element.animate` 用)。`index` でスタガー遅延が乗る。
 * 行は framer を使わず WAAPI で transform/opacity を一元管理する (framer の opacity が
 * 並べ替え時に絡んで「一瞬消える」のを避けるため)。`fill: backwards` で遅延中も初期状態
 * (opacity 0) を保ち、遅延前に一瞬見えてしまうのを防ぐ。
 */
export function enterKeyframes(
  variant: TableAnimationVariant,
  index: number,
): { keyframes: Keyframe[]; options: KeyframeAnimationOptions } {
  // 行の挿入は「左からスライドして所定位置へ入る」。fadeIn だけは横移動なしのフェード。
  const from = variant === 'fadeIn' ? 'translate(0px, 0px)' : 'translateX(-28px)'
  return {
    keyframes: [
      { opacity: 0, transform: from },
      { opacity: 1, transform: 'translate(0px, 0px)' },
    ],
    options: {
      duration: ROW_ENTER_MS,
      easing: FLIP_EASING_CSS,
      delay: Math.min(index, MAX_STAGGER_INDEX) * ROW_STAGGER_MS,
      fill: 'backwards',
    },
  }
}

/** FLIP の横レーン幅 (px)。上り/下りで左右に振り分け、移動中の行同士の重なりを防ぐ。 */
export const FLIP_LANE_PX = 40
/** FLIP の所要時間 (ms)。 */
const FLIP_DURATION_MS = 1000

/** フィルタ/ページングで行が詰まる/開くだけの移動 (純縦スライド) の所要時間 (ms)。 */
const ROW_SHIFT_MS = 280

/**
 * 行が縦に詰まる/開くだけの移動 (フィルタで上の行が消えて繰り上がる等) の純縦スライド。
 * `deltaY = 旧 top - 新 top`。並べ替えではないので横レーンに振らず、旧位置から新位置へ
 * まっすぐ滑らせるだけにする (sort 演出の lane-swing と区別する)。
 */
export function shiftYKeyframes(deltaY: number): {
  keyframes: Keyframe[]
  options: KeyframeAnimationOptions
} {
  return {
    keyframes: [
      { transform: `translateY(${deltaY}px)` },
      { transform: 'translateY(0px)' },
    ],
    options: { duration: ROW_SHIFT_MS, easing: FLIP_EASING_CSS },
  }
}

/**
 * 並べ替えで行が移動したときの FLIP アニメ (WAAPI `element.animate` 用)。
 * `deltaY = 旧 top - 新 top`。
 * - deltaY > 0 (行が上へ移動): **左**レーンを通る → 「左 → 上 → 右」
 * - deltaY < 0 (行が下へ移動): **右**レーンを通る → 「右 → 下 → 左」
 * 旧位置 (translateY=deltaY) から出発し、横レーンへ寄って縦移動、最後に元の x へ戻る。
 */
export function flipKeyframes(
  deltaY: number,
  opts?: { lanePx?: number; durationMs?: number },
): { keyframes: Keyframe[]; options: KeyframeAnimationOptions } {
  const lanePx = opts?.lanePx ?? FLIP_LANE_PX
  const durationMs = opts?.durationMs ?? FLIP_DURATION_MS
  const lane = deltaY > 0 ? -lanePx : lanePx
  return {
    keyframes: [
      { transform: `translate(0px, ${deltaY}px)`, offset: 0 },
      { transform: `translate(${lane}px, ${deltaY}px)`, offset: 0.25 },
      { transform: `translate(${lane}px, 0px)`, offset: 0.75 },
      { transform: `translate(0px, 0px)`, offset: 1 },
    ],
    options: { duration: durationMs, easing: FLIP_EASING_CSS },
  }
}

/** 列並べ替え FLIP の縦の振れ幅 (px)。この分だけ浮いて (or 沈んで) から横移動する。 */
const COL_LIFT_PX = 12

/**
 * 列の並べ替え (ピッカーで order 変更) 時の lift-carry-drop FLIP (WAAPI 用)。
 * `deltaX = 旧 left - 新 left`。列は横移動なので、縦に振ってから横へ運び、最後に戻す。
 * 方向で縦の向きを振り分ける (行ソートの上下→左右に対応):
 * - 右へ動く列 (deltaX < 0): **上** に振る → 上 → 右 → 下
 * - 左へ動く列 (deltaX > 0): **下** に振る → 下 → 左 → 上
 * 浮き/沈みの間に横を通るので、移動中の列が隣の行と重なりにくい。
 * 同じ列の th / 全 td に同じ keyframe を適用する。
 */
export function colFlipKeyframes(
  deltaX: number,
  opts?: { durationMs?: number; liftPx?: number },
): { keyframes: Keyframe[]; options: KeyframeAnimationOptions } {
  const durationMs = opts?.durationMs ?? FLIP_DURATION_MS
  const lift = opts?.liftPx ?? COL_LIFT_PX
  // 右へ動く (deltaX<0) は上 (-)、左へ動く (deltaX>0) は下 (+)。
  const offsetY = deltaX < 0 ? -lift : lift
  return {
    keyframes: [
      { transform: `translate(${deltaX}px, 0px)`, offset: 0 },
      { transform: `translate(${deltaX}px, ${offsetY}px)`, offset: 0.25 },
      { transform: `translate(0px, ${offsetY}px)`, offset: 0.75 },
      { transform: `translate(0px, 0px)`, offset: 1 },
    ],
    options: { duration: durationMs, easing: FLIP_EASING_CSS },
  }
}

/**
 * 列セル (th / td) のバリアント。`animationVariant` に応じて登場時のスライド方向を変える。
 * - 登場: variant 方向から少しスライドしつつフェードイン (table が即座に幅を確保)。
 * - 退場: width / padding を 0 へ畳んで隣の列が詰める。`whiteSpace: nowrap` を退場開始時に
 *   即座に効かせ、幅が縮む過程でテキストが折り返して行高が伸びるのを防ぐ。
 *
 * セルには `layout` を付けない。auto table-layout では行データ (フィルタ等) が変わると
 * 列の自然幅が変わり、`layout` を付けると「フィルタしただけで列が動く」誤作動になるため。
 * トグル時の隣列の詰めは退場の width アニメ自体が table を再レイアウトすることで担う。
 *
 * overflow はアニメ中だけ hidden にする (非アニメ値なので variant 開始時に即時適用され、
 * 登場完了時に transitionEnd で visible へ戻す)。常時 hidden にするとセル内の
 * CSS ツールチップ (行アクションの Tooltip atom 等) がセル境界で切られるため。
 */
export function cellVariants(variant: TableAnimationVariant): Variants {
  const hiddenOffset =
    variant === 'slideLeft' ? { x: -16, y: 0 } : variant === 'fadeIn' ? { x: 0, y: 0 } : { x: 0, y: -8 }
  return {
    hidden: { opacity: 0, overflow: 'hidden', ...hiddenOffset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: ENTER_SEC, ease: EASE_SMOOTH },
      transitionEnd: { overflow: 'visible' },
    },
    exit: {
      opacity: 0,
      width: 0,
      paddingLeft: 0,
      paddingRight: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      transition: { duration: EXIT_SEC, ease: EASE_SMOOTH },
    },
  }
}
