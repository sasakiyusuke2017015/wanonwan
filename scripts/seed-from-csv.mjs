// packages/db/seed/csv/*.csv を FK 依存順に postgres へ投入する（初回投入専用）。
//
// 「初回投入専用」: 各対象テーブルは投入前に行数を確認し、非空ならスキップする。
// CSV が真実の源になるのは空 DB の初回のみで、運用開始後（管理画面で編集・削除した後）の
// 再投入は no-op になる。これにより、画面で DELETE した行が CSV 残存で復活するのを防ぐ
// （ON CONFLICT DO NOTHING だけでは、消えた行は conflict しないため再 INSERT されてしまう）。
//
// 親参照は code 基準（例: departments.csv の division_code）。id は IDENTITY 任せで、
// INSERT 時に親 code をサブクエリで id へ解決する。CSV 値は sqlStr でエスケープして psql に流す
// （psql heredoc は prepared statement を使えないため、エスケープでインジェクションを防ぐ）。
//
// users はマスタとは別扱い。dev の users.csv は gotrue_id を固定で持つため public.users を
// 直接 INSERT できる（dev 専用）。stg/prod のユーザーは GoTrue 発行が必要なため本スクリプトでは
// 投入せず、scripts/provision.mjs が担う（--no-users で users を抑止する）。
//
// dev:        pnpm db:seed 経由（master + dev users）
// stg/prod:   node scripts/seed-from-csv.mjs --compose-file ... --env-file ... --no-users（master のみ）
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { parseEnvFile } from "./lib/env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvDir = join(root, "packages", "db", "seed", "csv");

function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}
function resolvePath(p) {
  return isAbsolute(p) ? p : join(root, p);
}

const composeFile = resolvePath(
  flag("compose-file") ?? process.env.COMPOSE_FILE ?? join("infra", "docker-compose.yml"),
);
const envFile = flag("env-file") ?? process.env.ENV_FILE;
const service = flag("service") ?? process.env.PG_SERVICE ?? "postgres";
const usersCsv = resolvePath(flag("users-csv") ?? join("packages", "db", "seed", "csv", "users.csv"));
const seedUsers = !hasFlag("no-users");

const fileEnv = envFile ? parseEnvFile(resolvePath(envFile)) : {};
const db = process.env.PG_DATABASE ?? fileEnv.PG_DATABASE ?? "waoon";
const user = process.env.PG_SUPERUSER ?? fileEnv.PG_SUPERUSER ?? "postgres";

// docker compose [--env-file X] -f compose exec -T <service> psql ...
function psqlArgs(extra = []) {
  const args = ["compose"];
  if (envFile) args.push("--env-file", resolvePath(envFile));
  args.push("-f", composeFile, "exec", "-T", service, "psql", "-v", "ON_ERROR_STOP=1", "-U", user, "-d", db);
  return args.concat(extra);
}
// SQL を流して stdout を返す（capture=true なら -tA でタプルのみ）。
function psql(sql, { capture = false } = {}) {
  return execFileSync("docker", psqlArgs(capture ? ["-tA"] : []), {
    input: sql,
    encoding: "utf8",
    stdio: ["pipe", capture ? "pipe" : "inherit", "inherit"],
  });
}

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`; // single quote エスケープ

// 空文字 / undefined を SQL NULL に、それ以外を sqlStr に。
function sqlValOrNull(v) {
  return v === undefined || v === "" ? "NULL" : sqlStr(v);
}

// 親 code を id へ解決するサブクエリ式。空なら NULL。
function refSubquery(table, code) {
  return code === undefined || code === ""
    ? "NULL"
    : `(SELECT id FROM public.${table} WHERE code = ${sqlStr(code)})`;
}

function rowCount(table) {
  return Number(psql(`SELECT count(*) FROM public.${table};`, { capture: true }).trim());
}

function readCsv(path) {
  const text = readFileSync(path, "utf8");
  return parse(text, { columns: true, skip_empty_lines: true, trim: true });
}

// マスタテーブル定義（FK 依存順）。build は 1 行を VALUES 用の式リストへ変換する。
const MASTER_TABLES = [
  {
    table: "divisions",
    columns: ["code", "name"],
    build: (r) => [sqlStr(r.code), sqlStr(r.name)],
  },
  {
    table: "departments",
    columns: ["code", "name", "division_id"],
    build: (r) => [sqlStr(r.code), sqlStr(r.name), refSubquery("divisions", r.division_code)],
  },
  {
    table: "sections",
    columns: ["code", "name", "department_id"],
    build: (r) => [sqlStr(r.code), sqlStr(r.name), refSubquery("departments", r.department_code)],
  },
  {
    table: "positions",
    columns: ["code", "name"],
    build: (r) => [r.code, sqlStr(r.name)], // code は int。数値はそのまま
  },
];

// 1 テーブルを投入。非空ならスキップ。ON CONFLICT は同一実行内の重複 CSV 行対策。
function seedTable({ table, columns, build, conflict = "code" }, rows) {
  const existing = rowCount(table);
  if (existing > 0) {
    console.log(`• ${table}: 既存 ${existing} 行 → スキップ（初回投入専用）`);
    return 0;
  }
  for (const r of rows) {
    const values = build(r).join(", ");
    psql(
      `INSERT INTO public.${table} (${columns.join(", ")}) VALUES (${values}) ON CONFLICT (${conflict}) DO NOTHING;`,
    );
  }
  console.log(`• ${table}: ${rows.length} 行を投入`);
  return rows.length;
}

// dev users.csv → public.users（gotrue_id 固定。org 参照は code → id 解決）。
function seedUsersTable(rows) {
  const existing = rowCount("users");
  if (existing > 0) {
    console.log(`• users: 既存 ${existing} 行 → スキップ（初回投入専用）`);
    return 0;
  }
  const cols = [
    "gotrue_id",
    "code",
    "name",
    "email",
    "position_id",
    "division_id",
    "department_id",
    "section_id",
  ];
  for (const r of rows) {
    const values = [
      sqlValOrNull(r.gotrue_id),
      sqlStr(r.code),
      sqlStr(r.name),
      sqlStr(r.email),
      refSubquery("positions", r.position_code),
      refSubquery("divisions", r.division_code),
      refSubquery("departments", r.department_code),
      refSubquery("sections", r.section_code),
    ].join(", ");
    psql(
      `INSERT INTO public.users (${cols.join(", ")}) VALUES (${values}) ON CONFLICT (email) DO NOTHING;`,
    );
  }
  console.log(`• users: ${rows.length} 行を投入`);
  return rows.length;
}

let total = 0;
for (const def of MASTER_TABLES) {
  const rows = readCsv(join(csvDir, `${def.table}.csv`));
  total += seedTable(def, rows);
}
if (seedUsers) {
  total += seedUsersTable(readCsv(usersCsv));
}
console.log(`done: seed-from-csv — ${total} 行投入（compose=${composeFile}）`);
