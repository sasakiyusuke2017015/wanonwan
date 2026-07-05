// フォームの「未保存変更あり」判定。submit 用 payload（正規化済み）を baseline と
// 現在値で安定 stringify して比較する。参照等価は使わない（毎レンダー新オブジェクトのため）。

// オブジェクトのキーを再帰的にソートして安定した JSON 文字列にする。
// 配列（AnswerForm の string[] 等）は順序を保持する。undefined は null 化して穴を揃える。
function stableStringify(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function normalize(value: unknown): unknown {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = normalize(obj[key]);
    }
    return sorted;
  }
  return value;
}

/** current が baseline と異なれば true（未保存変更あり）。 */
export function isDirtyPayload(current: unknown, baseline: unknown): boolean {
  return stableStringify(current) !== stableStringify(baseline);
}
