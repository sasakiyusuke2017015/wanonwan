import "server-only";

// GoTrue 接続情報（サーバ専用）。接続先・共有鍵ともに既定値は持たない。
// 注意: 検証はモジュール評価時ではなく「実際に使う時」に行う。
// next build は env を渡さずに走るため、import 時に throw するとビルドが落ちる。

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} が設定されていません（必須）`);
  return value;
}

export function getGotrueUrl(): string {
  return requireEnv("GOTRUE_URL");
}

// access_token 検証用の共有鍵。infra の JWT_SECRET と一致している必要がある。
export function getGotrueJwtSecret(): string {
  return requireEnv("GOTRUE_JWT_SECRET");
}
