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

// 文字列配列を jsonb 配列リテラルへ。要素は sqlStr でエスケープし text[] 経由で jsonb 化する。
function jsonbStringArray(values) {
  return values.length === 0
    ? `'[]'::jsonb`
    : `to_jsonb(ARRAY[${values.map(sqlStr).join(", ")}]::text[])`;
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

// 整数カラム用。生値補間する前に整数であることを保証する（非数値の混入を SQL 手前で弾く）。
function intLiteral(raw, label) {
  const n = Number(raw);
  if (!Number.isInteger(n)) {
    console.error(`✗ ${label} が整数ではありません: ${JSON.stringify(raw)}`);
    process.exit(1);
  }
  return String(n);
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
    build: (r) => [intLiteral(r.code, "positions.code"), sqlStr(r.name)], // code は int
  },
  {
    table: "urgency_levels",
    columns: ["code", "name"],
    build: (r) => [intLiteral(r.code, "urgency_levels.code"), sqlStr(r.name)], // code は int
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
    "role",
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
      sqlStr(r.role || "member"),
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

// ===== デモ（dev 表示用）データ =====
// アンケート/質問/掲載/回答/スケジュール + 非ログインのデモ回答者（gotrue_id NULL）。
// 画面が空だと見た目を確認できないため「ひととおり」の実データを投入する。
// FK は title / body / code で解決し、各テーブルは非空スキップ（初回投入専用）。

// 自然キー（title/body）で id を引くサブクエリ。col は固定識別子、val はエスケープ。
function refByValue(table, col, val) {
  return val === undefined || val === ""
    ? "NULL"
    : `(SELECT id FROM public.${table} WHERE ${col} = ${sqlStr(val)} ORDER BY id LIMIT 1)`;
}
function intOrNull(raw, label) {
  return raw === undefined || raw === "" ? "NULL" : intLiteral(raw, label);
}
function tsOrNull(raw) {
  return raw === undefined || raw === "" ? "NULL" : `${sqlStr(raw)}::timestamptz`;
}
// 評価 jsonb（満足度/業務負荷/職場環境/人間関係/ストレス）。全列空なら NULL。
function evalJson(r) {
  const keys = ["satisfaction", "workload", "environment", "relationship", "stress"];
  const present = keys.filter((k) => r[k] !== undefined && r[k] !== "");
  if (present.length === 0) return "NULL";
  const pairs = present.map((k) => `'${k}', ${intLiteral(r[k], `answers.${k}`)}`).join(", ");
  return `jsonb_build_object(${pairs})`;
}

// デモ用の汎用テーブル投入。非空スキップ。自然キー制約が無いので ON CONFLICT は使わない。
function seedDemoTable(table, columns, build) {
  const existing = rowCount(table);
  if (existing > 0) {
    console.log(`• ${table}: 既存 ${existing} 行 → スキップ`);
    return 0;
  }
  const rows = readCsv(join(csvDir, `${table}.csv`));
  for (const r of rows) {
    psql(`INSERT INTO public.${table} (${columns.join(", ")}) VALUES (${build(r).join(", ")});`);
  }
  console.log(`• ${table}: ${rows.length} 行を投入`);
  return rows.length;
}

function seedDemo() {
  let n = 0;

  // 1) デモ回答者（gotrue_id NULL = ログイン不可の表示用レコード）。demo01 の有無で冪等判定。
  const demoUsers = readCsv(join(csvDir, "demo_users.csv"));
  const exists = psql(`SELECT count(*) FROM public.users WHERE code = 'demo01';`, { capture: true }).trim();
  if (exists === "0") {
    for (const r of demoUsers) {
      const values = [
        sqlStr(r.code), sqlStr(r.name), sqlStr(r.email), sqlStr(r.role || "member"),
        refSubquery("positions", r.position_code), refSubquery("sections", r.section_code),
      ].join(", ");
      psql(`INSERT INTO public.users (code, name, email, role, position_id, section_id)
            VALUES (${values}) ON CONFLICT (email) DO NOTHING;`);
    }
    console.log(`• demo_users: ${demoUsers.length} 行を投入`);
    n += demoUsers.length;
  } else {
    console.log("• demo_users: 既存 → スキップ");
  }

  n += seedDemoTable("surveys", ["title", "status"], (r) => [sqlStr(r.title), sqlStr(r.status || "draft")]);

  n += seedDemoTable(
    "questions",
    ["body", "answer_type", "choices", "eval_item", "required", "sort_order"],
    (r) => [
      sqlStr(r.body), sqlStr(r.answer_type),
      jsonbStringArray((r.choices ?? "").split("|").map((s) => s.trim()).filter(Boolean)),
      sqlValOrNull(r.eval_item),
      r.required === "true" ? "true" : "false",
      intLiteral(r.sort_order || "0", "questions.sort_order"),
    ],
  );

  n += seedDemoTable(
    "survey_questions",
    ["survey_id", "question_id", "sort_order"],
    (r) => [
      refByValue("surveys", "title", r.survey_title),
      refByValue("questions", "body", r.question_body),
      intLiteral(r.sort_order || "0", "survey_questions.sort_order"),
    ],
  );

  n += seedDemoTable(
    "survey_publications",
    ["survey_id", "title", "body", "status", "start_at", "end_at"],
    (r) => [
      refByValue("surveys", "title", r.survey_title),
      sqlStr(r.title), sqlValOrNull(r.body),
      intLiteral(r.status || "100", "publications.status"),
      tsOrNull(r.start_at), tsOrNull(r.end_at),
    ],
  );

  n += seedDemoTable(
    "answers",
    ["publication_id", "respondent_id", "status", "evaluation", "health_status",
     "answered_at", "interview_at", "interview_method", "interviewer_id", "interview_memo", "next_action"],
    (r) => [
      refByValue("survey_publications", "title", r.publication_title),
      refSubquery("users", r.respondent_code),
      intLiteral(r.status || "100", "answers.status"),
      evalJson(r),
      intOrNull(r.health_status, "answers.health_status"),
      tsOrNull(r.answered_at), tsOrNull(r.interview_at),
      intOrNull(r.interview_method, "answers.interview_method"),
      r.interviewer_code ? refSubquery("users", r.interviewer_code) : "NULL",
      sqlValOrNull(r.interview_memo), sqlValOrNull(r.next_action),
    ],
  );

  n += seedDemoTable(
    "schedules",
    ["title", "body", "start_at", "end_at", "event_type", "color", "created_by"],
    (r) => [
      sqlStr(r.title), sqlValOrNull(r.body),
      tsOrNull(r.start_at), tsOrNull(r.end_at),
      sqlValOrNull(r.event_type), sqlValOrNull(r.color),
      r.created_by_code ? refSubquery("users", r.created_by_code) : "NULL",
    ],
  );

  return n;
}

let total = 0;
for (const def of MASTER_TABLES) {
  const rows = readCsv(join(csvDir, `${def.table}.csv`));
  total += seedTable(def, rows);
}
if (seedUsers) {
  total += seedUsersTable(readCsv(usersCsv));
}
// デモデータは opt-in（--demo）。stg/prod の provision からは渡さないので本番には入らない。
if (hasFlag("demo")) {
  total += seedDemo();
}
console.log(`done: seed-from-csv — ${total} 行投入（compose=${composeFile}）`);
