import type { BadgeColor } from "@ui-catalog/core/atoms";

// 未設定の緊急度はソートで末尾へ寄せるための番兵 code。実マスタの code より
// 十分大きい値にしておく（urgency_levels.code は小さい整数の想定）。
export const UNSET_URGENCY_CODE = 9999;

// 緊急度 code を Badge の色に落とす。
// urgency_levels は段数（行数）可変のマスタなので、code の絶対値ではなく
// 「マスタ全体での相対順位」で色を決める（下位=green / 中間=yellow / 上位=red）。
// sortedCodes は urgency_levels.code を昇順に並べたもの。code がマスタに無い、
// または段数が 1 以下で相対順位が定義できない場合は gray にフォールバックする。
export function urgencyBadgeColor(code: number, sortedCodes: number[]): BadgeColor {
  const index = sortedCodes.indexOf(code);
  if (index < 0 || sortedCodes.length <= 1) return "gray";
  const position = index / (sortedCodes.length - 1);
  if (position >= 2 / 3) return "red";
  if (position >= 1 / 3) return "yellow";
  return "green";
}
