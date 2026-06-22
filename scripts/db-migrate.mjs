// packages/db/schema/*.sql を昇順に postgres コンテナへ適用する（idempotent）。
// 00_bootstrap.sql は初回 initdb.d でも実行されるが、IF NOT EXISTS / CREATE OR REPLACE で冪等。
//
// dev:        pnpm db:migrate
// stg/prod:   node scripts/db-migrate.mjs --compose-file infra/docker-compose.stg.yml --env-file infra/.env.stg
//             （CD は COMPOSE_FILE / ENV_FILE / PG_SERVICE 環境変数でも上書きできる）
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnvFile } from "./lib/env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// --flag value 形式の最小パーサ。CLI フラグ > 環境変数 > dev 既定値 の優先順。
function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function resolvePath(p) {
  return isAbsolute(p) ? p : join(root, p);
}

const composeFile = resolvePath(
  flag("compose-file") ?? process.env.COMPOSE_FILE ?? join("infra", "docker-compose.yml"),
);
const envFile = flag("env-file") ?? process.env.ENV_FILE; // 未指定なら --env-file を付けない
const service = flag("service") ?? process.env.PG_SERVICE ?? "postgres";

// PG_DATABASE / PG_SUPERUSER の優先順: process.env > env file > 既定値。
// env file を渡したのに既定値 waoon/postgres へ向かう取りこぼしを防ぐ。
const fileEnv = envFile ? parseEnvFile(resolvePath(envFile)) : {};
const schemaDir = join(root, "packages", "db", "schema");
const db = process.env.PG_DATABASE ?? fileEnv.PG_DATABASE ?? "waoon";
const user = process.env.PG_SUPERUSER ?? fileEnv.PG_SUPERUSER ?? "postgres";

const files = readdirSync(schemaDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("no schema files found");
  process.exit(0);
}

// docker compose [--env-file X] -f compose exec -T <service> psql ...
// stg/prod compose は secrets を ${VAR:?required} で参照するため、exec でも env-file が要る。
const baseArgs = ["compose"];
if (envFile) baseArgs.push("--env-file", resolvePath(envFile));
baseArgs.push("-f", composeFile, "exec", "-T", service, "psql", "-v", "ON_ERROR_STOP=1", "-U", user, "-d", db);

for (const file of files) {
  const sql = readFileSync(join(schemaDir, file), "utf8");
  process.stdout.write(`applying ${file} ... `);
  execFileSync("docker", baseArgs, { input: sql, stdio: ["pipe", "inherit", "inherit"] });
  console.log("ok");
}

console.log(`done: ${files.length} file(s) applied to ${composeFile} [${service}]`);
