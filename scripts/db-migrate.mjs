// DDL を postgres コンテナへ適用する。migrations が真実・snapshot は生成物（案 B）。
//
// 単一コマンドで 3 パターンを自動分岐する:
//   1) 真に空の DB      … snapshot/schema.sql を 1 本適用（高速）。schema_migrations も埋まる
//   2) 既存(旧構築含む)  … 既存を baseline(0001) として採用し、未適用 migration だけ増分適用
//   3) snapshot 無し     … migrations/*.sql を 0001 から順に全適用
//
// ロール/スキーマ/拡張(vector/pgtap/pgmq)は 00_bootstrap.sql（initdb.d）が先に作る前提。
// pg_cron は 0001_initial 内で作成する。
//
// 接続先（DB 名 / superuser）は env ファイル必須。dev も infra/.env を読む。
//
// dev:        pnpm db:migrate
// stg/prod:   node scripts/db-migrate.mjs --compose-file infra/docker-compose.stg.yml --env-file infra/.env.stg
//             （CD は COMPOSE_FILE / ENV_FILE / PG_SERVICE 環境変数でも上書きできる）
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, requireEnv } from "./lib/env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
const envFile = resolvePath(flag("env-file") ?? process.env.ENV_FILE ?? join("infra", ".env"));
const service = flag("service") ?? process.env.PG_SERVICE ?? "postgres";

const env = loadEnv(envFile);
const migrationsDir = join(root, "packages", "db", "migrations");
const snapshotFile = join(root, "packages", "db", "snapshot", "schema.sql");
const db = requireEnv(env, "PG_DATABASE");
const user = requireEnv(env, "PG_SUPERUSER");

// docker compose --env-file X -f compose exec -T <service> psql ...
// compose は secrets を ${VAR:?required} で参照するため、exec でも env-file が要る。
function psqlArgs(extra = []) {
  const args = ["compose", "--env-file", envFile];
  args.push("-f", composeFile, "exec", "-T", service, "psql", "-v", "ON_ERROR_STOP=1", "-U", user, "-d", db);
  return args.concat(extra);
}
// SQL を流す。capture=true なら -tA でタプルのみ stdout を返す。
function psql(sql, { capture = false } = {}) {
  return execFileSync("docker", psqlArgs(capture ? ["-tA"] : []), {
    input: sql,
    encoding: "utf8",
    stdio: ["pipe", capture ? "pipe" : "inherit", "inherit"],
  });
}
const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

// migrations/*.sql を昇順に。ファイル名先頭の 4 桁連番を version とする。
function listMigrations() {
  return readdirSync(migrationsDir)
    .filter((f) => /^\d{4}_.*\.sql$/.test(f))
    .sort()
    .map((f) => ({ version: f.replace(/\.sql$/, ""), file: join(migrationsDir, f) }));
}

const CREATE_TRACKER = `
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version    text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);`;

// 1 migration を 1 トランザクションで適用し version を記録する。
// 先頭に `-- migrate:no-transaction` があるものはラップしない（CREATE INDEX CONCURRENTLY 等）。
function applyMigration({ version, file }) {
  const body = readFileSync(file, "utf8");
  const record = `INSERT INTO public.schema_migrations(version) VALUES (${sqlStr(version)});`;
  process.stdout.write(`applying ${version} ... `);
  if (/^\s*--\s*migrate:no-transaction/m.test(body)) {
    psql(`${body}\n${record}`);
  } else {
    psql(`BEGIN;\n${body}\n${record}\nCOMMIT;`);
  }
  console.log("ok");
}

const trackerExists = psql("SELECT to_regclass('public.schema_migrations') IS NOT NULL;", {
  capture: true,
}).trim();

const migrations = listMigrations();
if (migrations.length === 0) {
  console.log("no migration files found");
  process.exit(0);
}

if (trackerExists === "f") {
  // schema_migrations が無い = fresh か、旧 schema/*.sql 方式で構築された既存 DB。
  const hasAppTables =
    psql("SELECT to_regclass('public.users') IS NOT NULL;", { capture: true }).trim() === "t";

  if (hasAppTables) {
    // 旧方式で既にテーブルがある。中身は 0001_initial と一致する前提で baseline 採用し、
    // 0001 を「適用済み」として記録する（再実行しない）。以降は増分だけ当てる。
    const [first, ...rest] = migrations;
    console.log(`adopting existing schema as baseline: ${first.version}`);
    psql(
      `${CREATE_TRACKER}\nINSERT INTO public.schema_migrations(version) VALUES (${sqlStr(first.version)});`,
    );
    for (const m of rest) applyMigration(m);
    console.log(`done: baseline ${first.version} + ${rest.length} incremental migration(s)`);
  } else if (existsSync(snapshotFile)) {
    // 真に空 → snapshot 高速パス。snapshot が schema_migrations を作成・記入する。
    console.log("empty DB → applying snapshot/schema.sql (fast path)");
    psql(readFileSync(snapshotFile, "utf8"));
    const n = psql("SELECT count(*) FROM public.schema_migrations;", { capture: true }).trim();
    console.log(`done: snapshot applied (${n} migration(s) marked)`);
  } else {
    // 空 & snapshot 無し → 全 migration を順次適用。
    console.log("empty DB, no snapshot → applying all migrations");
    psql(CREATE_TRACKER);
    for (const m of migrations) applyMigration(m);
    console.log(`done: ${migrations.length} migration(s) applied`);
  }
} else {
  // 既存 tracker。未適用の version だけを増分適用（本番の通常運用）。
  const appliedRaw = psql("SELECT version FROM public.schema_migrations;", { capture: true }).trim();
  const applied = new Set(appliedRaw ? appliedRaw.split(/\r?\n/) : []);
  const pending = migrations.filter((m) => !applied.has(m.version));
  if (pending.length === 0) {
    console.log(`up to date: ${applied.size} migration(s) applied, 0 pending`);
    process.exit(0);
  }
  for (const m of pending) applyMigration(m);
  console.log(`done: ${pending.length} pending migration(s) applied`);
}
