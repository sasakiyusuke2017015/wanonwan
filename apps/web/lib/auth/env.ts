import "server-only";

// GoTrue 接続情報（サーバ専用）。
// 注意: 検証はモジュール評価時ではなく「実際に使う時」に行う。
// next build は NODE_ENV=production で走るため、import 時に throw するとビルドが落ちる。
export const GOTRUE_URL = process.env.GOTRUE_URL ?? "http://localhost:9999";

const DEV_FALLBACK_SECRET = "dev-only-change-me-please-32bytes-minimum";

// access_token 検証用の共有鍵。stg/prod では env 必須（未設定なら実行時に throw）。
// dev は compose の既定値にフォールバック。
export function getGotrueJwtSecret(): string {
  const secret = process.env.GOTRUE_JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("GOTRUE_JWT_SECRET is required in production");
  }
  return DEV_FALLBACK_SECRET;
}
