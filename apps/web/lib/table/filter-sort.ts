// 管理一覧の client-side フィルタ/ソート（純関数）。AdminListTable から使う。
// データ量が小さい前提（サーバ側ページング/ソートは非目的）。

export type SortDir = "asc" | "desc";

// query を keys 列の文字列に部分一致（大小無視）。query 空なら全件素通し。
export function filterRows<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
  keys: (keyof T)[],
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
  );
}

// 値同士の比較。数値は数値順、それ以外は ja ロケールの文字列順。
function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "ja");
}

// key で安定ソート（元配列は破壊しない）。null/undefined は dir に関わらず末尾。
export function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T | null,
  dir: SortDir,
): T[] {
  if (!key) return rows;
  const factor = dir === "desc" ? -1 : 1;
  return [...rows].sort((x, y) => {
    const a = x[key];
    const b = y[key];
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return factor * compareValues(a, b);
  });
}
