import "server-only";

// apps/web は app_user で DB に接続する（public スキーマのみ・RLS 対象）。
// 接続先に既定値は持たない（誤った DB に黙って繋がるのを防ぐ）。
// 検証はモジュール評価時ではなく初回アクセス時に行う（DATABASE_URL を渡さない
// `next build` を落とさないため）。
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません（必須）");
  return url;
}
