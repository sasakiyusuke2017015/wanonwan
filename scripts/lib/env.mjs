// env ファイル（KEY=VALUE）の最小パーサ。dotenv 非依存。
// scripts/check-secrets.mjs / db-migrate.mjs / provision.mjs で共有する。
import { readFileSync } from "node:fs";

// コメント行・空行は無視。行末コメント（# 以降）は落とす。値の前後空白は trim。
// 値に # を含む secret は使わない前提（check-secrets が placeholder を弾く）。
export function parseEnvFile(path) {
  const out = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    out[key] = trimmed.slice(eq + 1).split("#")[0].trim();
  }
  return out;
}
