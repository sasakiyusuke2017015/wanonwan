// dev / stg / prod を空状態から初期化する。組織マスタを CSV から投入し、人員 CSV のユーザーを発行する。
//   1) 組織マスタ seed を CSV ローダー（seed-from-csv.mjs --no-users・非空スキップ）で適用
//   2) 人員 CSV（--users-csv）の全行を GoTrue admin API で発行 → public.users に gotrue_id 付きで
//      紐付け（行単位で冪等。既存は skip / DB insert 失敗時のみ GoTrue を cleanup）
//   3) 一時 PW を 0600 ファイルへ書き出し（stdout/CI には出さない）。各ユーザーは初回ログインで PW 変更を強制
//
// 投入は人員 CSV（--users-csv）の一括のみ。admin は CSV の role 列に 'admin' を指定する。
// CSV 列: code,name,email,gotrue_id,role,position_code,division_code,department_code,section_code
// （gotrue_id は空で GoTrue 採番。role は admin/member。org 系 code は既存マスタ参照・不要なら空）
//
// 使い方（host で実行。stack 起動 + migration 適用後）:
//   dev:  pnpm provision:dev                                       （既定で infra/provision-users.example.csv を使う）
//   dev:  pnpm provision:dev  --users-csv <path>                   （別 CSV を使う場合）
//   stg:  pnpm provision:stg  --users-csv /secure/path/staff.csv   （実メールを含む CSV は VCS に置かない）
//   prod: pnpm provision:prod --users-csv /secure/path/staff.csv
//   先に migrate を流して public.users 等のテーブルを作っておくこと（未適用だと参照で落ちる）。
//
// dev の seed は本スクリプト（provision:dev）が担う。RLS テスト用の固定 5 ユーザ
// （admin/alice/bob/carol/dave、users.csv 駆動）は scripts/seed-gotrue-dev.mjs にあり、CI 用の db:seed と
// 対で使う（手動の dev 起動では provision:dev を使う）。
//
// DB は postgres を直接公開しないため docker compose exec 経由。GoTrue(内部のみ)へは
// compose ネットワーク上の使い捨て curl コンテナから到達する。
import { readFileSync, writeFileSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { dirname, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { parseEnvFile } from "./lib/env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 値なしフラグ（例: --dev）。
function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}
// 値ありフラグ。値が欠落（次トークンが別フラグ or 末尾）なら undefined を返し、
// `--users-csv --dev` のように次のフラグを値として誤認しない。
function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const value = process.argv[i + 1];
  if (value === undefined || value.startsWith("--")) return undefined;
  return value;
}
function resolvePath(p) {
  return isAbsolute(p) ? p : join(root, p);
}
function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

// dev 既定値。GoTrue は compose の ${JWT_SECRET:-...} 既定でトークン検証するため、
// provision の署名 secret も同じ既定に合わせる（未一致だと GoTrue が 401 になる）。
const DEV_COMPOSE = "infra/docker-compose.yml";
const DEV_NETWORK = "waoon";
const DEV_JWT_SECRET = "dev-only-change-me-please-32bytes-minimum";

const isDev = hasFlag("dev");

const composeFileRel =
  flag("compose-file") ?? (isDev ? DEV_COMPOSE : "infra/docker-compose.prod.yml");
const composeFile = resolvePath(composeFileRel);

// B-2: --dev ⇔ dev compose の整合を強制し、network フォールバックの誤爆を封じる。
//   - --dev は dev compose 以外を受けない（stg/prod compose との矛盾指定を die）。
//   - dev compose を素で渡す（--dev 無し）と従来の「prod 以外は waoon-stg」判定に刺さるため die。
if (isDev && composeFileRel !== DEV_COMPOSE) {
  die(`--dev は dev compose (${DEV_COMPOSE}) 専用です（--compose-file ${composeFileRel} は不可）`);
}
if (!isDev && composeFileRel === DEV_COMPOSE) {
  die(`dev compose (${DEV_COMPOSE}) を使うには --dev が必要です（stg/prod は provision:stg/prod）`);
}

// 投入対象は人員 CSV（--users-csv）。各行が email/code/role/org を持つ。
// dev は既定でリポジトリ同梱のサンプル CSV を使う（`--users-csv` で上書き可）。
// stg/prod は実メールを含むため --users-csv を必須にする（CSV は VCS に置かない）。
const DEV_DEFAULT_USERS_CSV = "infra/provision-users.example.csv";
// dev は固定 PW で直接ログインできるようにする（localhost dev 限定の使い捨て。seed:gotrue:dev と同じ思想）。
// stg/prod はランダム PW + must_change + 0600 ファイルのまま（本番で固定 PW にしない）。
const DEV_FIXED_PASSWORD = "Admin1234!";
const usersCsv = flag("users-csv") ?? (isDev ? DEV_DEFAULT_USERS_CSV : undefined);
// compose ネットワーク名（networks.waoon.name）。dev→waoon / prod→waoon-prod / stg→waoon-stg。
// dev は無条件 waoon 強制（filename ヒューリスティックに頼らない）。
const network = isDev
  ? DEV_NETWORK
  : (flag("network") ?? (composeFileRel.includes("prod") ? "waoon-prod" : "waoon-stg"));

if (!usersCsv) {
  die("--users-csv は必須です（stg/prod の人員 CSV パス。実メールを含むため VCS に置かない）");
}

// 環境別に PG 接続情報と JWT_SECRET を決める。
//   dev   : env ファイルを secret に使わない。process.env ?? dev 既定。psql も --env-file 無し。
//   stg/prod: env ファイル必須（現状維持）。
// JWT_SECRET は逆ガード/ガードの検査対象と mintServiceRoleToken の署名で同一の単一 const（B-1）。
let envFile; // stg/prod のみ psql --env-file に渡す。dev は undefined。
let PG_SUPERUSER, PG_DATABASE, JWT_SECRET;
if (isDev) {
  PG_SUPERUSER = process.env.PG_SUPERUSER || "postgres";
  PG_DATABASE = process.env.PG_DATABASE || "waoon";
  JWT_SECRET = process.env.JWT_SECRET ?? DEV_JWT_SECRET;
  // dev 逆ガード: dev 値でなければ die（本番 secret での誤実行を防ぐ）。
  // dev 値でない secret で署名すると、dev 既定で検証する GoTrue に弾かれ login 不能 orphan になる（B-1 と対）。
  if (!JWT_SECRET.includes("dev-only-change-me")) {
    die("--dev は dev 既定の JWT_SECRET でのみ使えます（stg/prod は provision:stg/prod を使用）");
  }
} else {
  envFile = resolvePath(flag("env-file") ?? "infra/.env.prod");
  const env = parseEnvFile(envFile);
  PG_SUPERUSER = env.PG_SUPERUSER || "postgres";
  PG_DATABASE = env.PG_DATABASE || "waoon";
  JWT_SECRET = env.JWT_SECRET;
  if (!JWT_SECRET || JWT_SECRET.includes("dev-only-change-me")) {
    die("JWT_SECRET が未設定か dev 値です。先に check:secrets を通してください");
  }
}

const base64url = (buf) => Buffer.from(buf).toString("base64url");

// GoTrue admin API 用の service_role JWT（HS256, 60s）。provisioning.ts と同等。
function mintServiceRoleToken() {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({ role: "service_role", aud: "authenticated", iat: now, exp: now + 60 }),
  );
  const data = `${header}.${payload}`;
  const sig = createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

// 初期パスワード（20 文字・紛らわしい文字を除外・rejection sampling）。provisioning.ts と同等。
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
function generateInitialPassword() {
  const n = PASSWORD_ALPHABET.length;
  const limit = Math.floor(256 / n) * n;
  let out = "";
  while (out.length < 20) {
    for (const b of randomBytes(20)) {
      if (out.length >= 20) break;
      if (b < limit) out += PASSWORD_ALPHABET[b % n];
    }
  }
  return out;
}

// docker compose exec -T postgres psql ... に SQL を流し込み、stdout を返す。
// dev は env ファイル無しで compose 既定値を使うため --env-file を付けない。
function psql(sql, { capture = false } = {}) {
  const args = ["compose"];
  if (envFile) args.push("--env-file", envFile);
  args.push(
    "-f",
    composeFile,
    "exec",
    "-T",
    "postgres",
    "psql",
    "-v",
    "ON_ERROR_STOP=1",
    "-U",
    PG_SUPERUSER,
    "-d",
    PG_DATABASE,
  );
  if (capture) args.push("-tA"); // タプルのみ・非整列（パースしやすく）
  return execFileSync("docker", args, {
    input: sql,
    encoding: "utf8",
    stdio: ["pipe", capture ? "pipe" : "inherit", "inherit"],
  });
}

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`; // single quote エスケープ
// 親 code を id へ解決するサブクエリ。空なら NULL（org 列は nullable）。
const refSub = (table, c) =>
  c === undefined || c === "" ? "NULL" : `(SELECT id FROM public.${table} WHERE code = ${sqlStr(c)})`;

// compose ネットワーク上の使い捨て curl コンテナで GoTrue admin API を叩く。
// token は呼び出しごとに発行（60s 有効。N 名ループでの期限切れを避ける）。
function curlGoTrue(method, path, bodyObj) {
  const args = [
    "run", "--rm", "--network", network, "curlimages/curl:latest",
    "-s", "--fail-with-body", "-X", method, `http://gotrue:9999${path}`,
    "-H", `authorization: Bearer ${mintServiceRoleToken()}`,
  ];
  if (bodyObj !== undefined) {
    args.push("-H", "content-type: application/json", "-d", JSON.stringify(bodyObj));
  }
  return execFileSync("docker", args, { encoding: "utf8" });
}

// --- 1) 組織マスタ seed（CSV ローダー・非空スキップで冪等） ---
console.log("• 組織マスタ seed を適用 (seed-from-csv.mjs --no-users)");
const loaderArgs = [join(root, "scripts", "seed-from-csv.mjs"), "--no-users", "--compose-file", composeFileRel];
if (envFile) loaderArgs.push("--env-file", envFile);
execFileSync("node", loaderArgs, { stdio: "inherit" });

// --- 2) 投入対象ユーザーの一覧を人員 CSV から組み立てる ---
// 権限は role 列（'admin'|'member'）。役職(position)とは別軸。
const targets = parse(readFileSync(resolvePath(usersCsv), "utf8"), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
}).map((r) => ({
  email: r.email,
  name: r.name,
  code: r.code,
  gotrueId: r.gotrue_id || undefined,
  role: r.role || "member",
  positionCode: r.position_code,
  divisionCode: r.division_code,
  departmentCode: r.department_code,
  sectionCode: r.section_code,
}));

// --- 3) 行単位で冪等に発行（既存は skip / DB insert 失敗時のみ GoTrue を cleanup） ---
const credentials = []; // { email, password }
let created = 0, skipped = 0, failed = 0;
for (const t of targets) {
  if (!t.email || !t.code) {
    console.error(`✗ email / code が空の行をスキップ: ${JSON.stringify(t)}`);
    failed++;
    continue;
  }
  // role は 'admin' / 'member' のみ（DB CHECK の手前で typo を分かりやすく弾く）。
  if (t.role !== "admin" && t.role !== "member") {
    console.error(`✗ ${t.email}: role は admin / member のみ（指定: ${JSON.stringify(t.role)}）`);
    failed++;
    continue;
  }
  // 既存チェック（GoTrue 発行前に email / code を独立に確認。既存なら skip）。
  const dup = psql(
    `SELECT count(*) FROM public.users WHERE email = ${sqlStr(t.email)} OR code = ${sqlStr(t.code)};`,
    { capture: true },
  ).trim();
  if (dup !== "0") {
    console.log(`• 既存（スキップ）: ${t.email}`);
    skipped++;
    continue;
  }

  // GoTrue identity を発行。dev は固定 PW で直接ログイン可（must_change なし）。
  // stg/prod はランダム一時 PW + must_change_password で初回変更を強制。
  const password = isDev ? DEV_FIXED_PASSWORD : generateInitialPassword();
  let gotrueId;
  try {
    const reqBody = {
      email: t.email,
      password,
      email_confirm: true,
      user_metadata: { name: t.name },
      app_metadata: { must_change_password: !isDev },
    };
    if (t.gotrueId) reqBody.id = t.gotrueId; // dev は固定 UUID。stg/prod は GoTrue 採番
    const res = curlGoTrue("POST", "/admin/users", reqBody);
    gotrueId = JSON.parse(res).id;
    if (!gotrueId) throw new Error(`unexpected GoTrue response: ${res}`);
  } catch (e) {
    console.error(`✗ ${t.email} の GoTrue 発行に失敗: ${e.stdout || e.message}`);
    failed++;
    continue;
  }

  // public.users に紐付け。失敗時は当該行の GoTrue を掃除して orphan を残さない。
  try {
    psql(`
      INSERT INTO public.users (gotrue_id, code, name, email, role, position_id, division_id, department_id, section_id)
      SELECT ${sqlStr(gotrueId)}::uuid, ${sqlStr(t.code)}, ${sqlStr(t.name)}, ${sqlStr(t.email)}, ${sqlStr(t.role)},
        ${refSub("positions", t.positionCode)}, ${refSub("divisions", t.divisionCode)},
        ${refSub("departments", t.departmentCode)}, ${refSub("sections", t.sectionCode)};
    `);
  } catch (e) {
    console.error(`✗ ${t.email} の public.users insert に失敗。GoTrue を掃除します: ${e.message}`);
    try {
      curlGoTrue("DELETE", `/admin/users/${gotrueId}`);
    } catch {
      console.error(`  GoTrue orphan cleanup 失敗: gotrue_id=${gotrueId}（手動削除してください）`);
    }
    failed++;
    continue;
  }
  console.log(`• 作成: ${t.email}`);
  credentials.push({ email: t.email, password });
  created++;
}

// --- 4) PW の提示 ---
// dev は固定 PW なので stdout に出して良い（localhost 限定の使い捨て・seed と同じ）。
// stg/prod は一時 PW を stdout/CI に出さず 0600 ファイルへ（配布後に削除する運用）。
if (isDev) {
  // 新規作成が無くても（再実行で全員 skip でも）dev は固定 PW を毎回案内する。
  console.log(`\n✓ dev ユーザーの初期パスワードは「${DEV_FIXED_PASSWORD}」（固定・直接ログイン可）`);
} else if (credentials.length > 0) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const credPath = resolvePath(`provision-credentials-${stamp}.txt`);
  const lines = [
    "# 初期パスワード（一度きり・配布後にこのファイルを削除してください）",
    "# 各ユーザーは初回ログイン時にパスワード変更を求められます（must_change_password）。",
    ...credentials.map((c) => `${c.email}\t${c.password}`),
  ];
  writeFileSync(credPath, lines.join("\n") + "\n", { mode: 0o600 });
  chmodSync(credPath, 0o600); // umask の影響を受けないよう明示
  console.log(`\n✓ 初期パスワードを書き出しました（stdout には出しません）: ${credPath}`);
}

console.log(`\ndone: provision — created ${created}, skipped ${skipped}, failed ${failed}`);
if (failed > 0) process.exit(1);
