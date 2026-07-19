/**
 * 分数を「45分」「2時間」「1時間30分」形式に整形する。
 * コースの目安時間表示 (CourseCard / コース管理のライブプレビュー) で共用する。
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}分`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}時間` : `${h}時間${m}分`
}
