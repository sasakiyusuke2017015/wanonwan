// stg/prod の env から dev フォールバック secret が漏れていないか検証する（B-2 grep ガード）。
// prod/stg compose 起動前・CD deploy 前に走らせ、dev の弱い既定値で本番が立ち上がる
// 事故を fail-closed で止める。
// 使い方: node scripts/check-secrets.mjs infra/.env.prod
import { parseEnvFile } from "./lib/env.mjs";

const envPath = process.argv[2];
if (!envPath) {
  console.error("usage: node scripts/check-secrets.mjs <env-file>");
  process.exit(2);
}

let env;
try {
  env = parseEnvFile(envPath);
} catch {
  console.error(`✗ env file not found: ${envPath}`);
  process.exit(2);
}

const errors = [];

// 各 secret に対し「未設定 / dev 既定値 / placeholder」を拒否する。
// dev の既定値（dev compose・00_bootstrap.sql・.env.example 由来）はそのまま本番に出してはいけない。
function requireSecret(key, devDefault, { minBytes = 0 } = {}) {
  const val = env[key] ?? "";
  if (!val) {
    errors.push(`${key} が未設定です（必須）`);
    return;
  }
  if (val.includes("dev-only-change-me") || (devDefault && val === devDefault)) {
    errors.push(`${key} が dev 既定値のままです`);
    return;
  }
  if (minBytes && Buffer.byteLength(val, "utf8") < minBytes) {
    errors.push(`${key} は ${minBytes} バイト以上が必要です`);
  }
}

// JWT は認証バイパス級。DB role 3 種は postgres を非公開にしていても本番固定値は不可。
requireSecret("JWT_SECRET", "dev-only-change-me-please-32bytes-minimum", { minBytes: 32 });
requireSecret("PG_SUPERUSER_PASSWORD", "postgres");
requireSecret("AUTH_ADMIN_PASSWORD", "authadmin"); // supabase_auth_admin（00_bootstrap.sql 既定）
requireSecret("APP_DB_PASSWORD", "app"); //            app_user（00_bootstrap.sql 既定）
requireSecret("MINIO_ROOT_PASSWORD", "minioadmin"); // MinIO root（dev 既定 minioadmin は本番不可）

// プレースホルダのまま起動していないか（テンプレートの example ドメインが残っている）。
// 未設定も拒否する: キー名を取り違えると undefined が「プレースホルダでない」と誤判定され、
// nginx server_name が空のまま起動してしまうため（fail-open を塞ぐ）。
const domain = env.WANONWAN_DOMAIN ?? "";
if (!domain) {
  errors.push("WANONWAN_DOMAIN が未設定です（必須）");
} else if (domain.endsWith(".example.com")) {
  errors.push("WANONWAN_DOMAIN が example.com のプレースホルダのままです");
}

// AI 外部送信は二重 gate。key があるのに承認フラグが無い stg/prod を fail-closed で拒否する
// （テスト目的の ANTHROPIC_API_KEY 混入で面談データが Claude に流れる事故を防ぐ）。
if ((env.ANTHROPIC_API_KEY ?? "") && env.AI_EXTERNAL_PROCESSING_APPROVED !== "true") {
  errors.push(
    "ANTHROPIC_API_KEY があるのに AI_EXTERNAL_PROCESSING_APPROVED=true がありません（外部送信の承認 gate 未設定）",
  );
}

if (errors.length > 0) {
  console.error(`✗ secrets チェック失敗 (${envPath}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ secrets チェック OK (${envPath})`);
