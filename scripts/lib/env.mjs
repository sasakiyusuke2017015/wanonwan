// env ファイル（KEY=VALUE）の最小パーサと必須 env の取り出し。dotenv 非依存。
// scripts/check-secrets.mjs / db-migrate.mjs / db-test.mjs / db-psql.mjs / provision.mjs で共有する。
import { existsSync, readFileSync } from "node:fs";

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

// env ファイルに process.env を重ねた設定を返す。ファイルが無ければ即失敗する。
// process.env を優先するのは docker compose の解決順（shell env > --env-file）に合わせるため。
// ここだけファイル優先にすると、compose が作ったコンテナと psql の接続先がズレる。
export function loadEnv(path) {
  if (!existsSync(path)) {
    console.error(`✗ env ファイルがありません: ${path}`);
    console.error("  同じディレクトリの .env.example をコピーして値を設定してください");
    process.exit(2);
  }
  return { ...parseEnvFile(path), ...process.env };
}

// 必須 env を取り出す。未設定・空文字はその場で失敗させる。
// 既定値を持たせると、接続先や DB 名を取り違えたまま別環境に繋がって気付けない。
export function requireEnv(env, key, hint) {
  const value = env[key]?.trim();
  if (!value) {
    console.error(`✗ ${key} が未設定です（必須）${hint ? `: ${hint}` : ""}`);
    process.exit(2);
  }
  return value;
}
