// dev / stg / prod を空状態から初期化し、admin 1 名を発行する。
//   1) 組織マスタ seed（00_org.sql）だけを適用（手書き UUID のユーザー seed は流さない）
//   2) admin 1 名を GoTrue admin API で発行 → public.users に gotrue_id 付きで紐付け
//   3) 初期パスワードを一度だけ表示
//
// 使い方（host で実行。stack 起動 + migration 適用後）:
//   dev:  pnpm provision:dev  --email padmin@example.com --code padmin
//   stg:  pnpm provision:stg  --email admin@your-domain.jp
//   prod: pnpm provision:prod --email admin@your-domain.jp
//   先に migrate を流して public.users 等のテーブルを作っておくこと（未適用だと参照で落ちる）。
//
// dev の固定 4 ユーザ（admin/alice/bob/carol、RLS テスト用・dev:up 組込み）は scripts/seed-gotrue-dev.mjs
// が担う。本スクリプトの dev モードは「任意 email の ad-hoc admin を 1 名発行する」用途で役割が異なる。
// 本スクリプトは CI / dev:up には組み込まない（手動 ad-hoc 専用）。
//
// DB は postgres を直接公開しないため docker compose exec 経由。GoTrue(内部のみ)へは
// compose ネットワーク上の使い捨て curl コンテナから到達する。
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { dirname, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnvFile } from "./lib/env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 値なしフラグ（例: --dev）。
function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}
// 値ありフラグ。値が欠落（次トークンが別フラグ or 末尾）なら undefined を返し、
// `--email --code foo` のように次のフラグを値として誤認しない。
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

const email = flag("email");
const name = flag("name") ?? "管理者";
const code = flag("code") ?? "admin";
// compose ネットワーク名（networks.waoon.name）。dev→waoon / prod→waoon-prod / stg→waoon-stg。
// dev は無条件 waoon 強制（filename ヒューリスティックに頼らない）。
const network = isDev
  ? DEV_NETWORK
  : (flag("network") ?? (composeFileRel.includes("prod") ? "waoon-prod" : "waoon-stg"));

if (!email) die("--email は必須です（初期 admin のメールアドレス）");

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

// --- 1) 組織マスタ seed（idempotent） ---
console.log("• 組織マスタ seed を適用 (00_org.sql)");
psql(readFileSync(join(root, "packages", "db", "seed", "00_org.sql"), "utf8"));

// --- 既存チェック（GoTrue 発行前に email / code 双方を独立に弾く） ---
// dev は seed の admin が code='admin' を使うため、既定 code=admin だと衝突する。--code で一意値を指定する。
const emailExists = psql(`SELECT count(*) FROM public.users WHERE email = ${sqlStr(email)};`, {
  capture: true,
}).trim();
if (emailExists !== "0") {
  die(`${email} は既に public.users に存在します。provisioning を中止しました`);
}
const codeExists = psql(`SELECT count(*) FROM public.users WHERE code = ${sqlStr(code)};`, {
  capture: true,
}).trim();
if (codeExists !== "0") {
  die(`code=${code} は既に public.users に存在します。--code で一意な値を指定してください（例: --code padmin）`);
}

// --- 2) GoTrue identity を発行 ---
console.log(`• GoTrue admin user を発行 (${email})`);
const password = generateInitialPassword();
const token = mintServiceRoleToken();
const body = JSON.stringify({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
});
let gotrueId;
try {
  const res = execFileSync(
    "docker",
    [
      "run",
      "--rm",
      "--network",
      network,
      "curlimages/curl:latest",
      "-s",
      "--fail-with-body",
      "-X",
      "POST",
      "http://gotrue:9999/admin/users",
      "-H",
      `authorization: Bearer ${token}`,
      "-H",
      "content-type: application/json",
      "-d",
      body,
    ],
    { encoding: "utf8" },
  );
  gotrueId = JSON.parse(res).id;
  if (!gotrueId) throw new Error(`unexpected GoTrue response: ${res}`);
} catch (e) {
  die(`GoTrue admin user の作成に失敗しました: ${e.stdout || e.message}`);
}

// --- 3) public.users に gotrue_id 付きで紐付け（admin: position 999 / HQ-DEPT1-SEC1） ---
console.log("• public.users に admin を作成");
try {
  psql(`
    INSERT INTO public.users (gotrue_id, code, name, email, position_id, division_id, department_id, section_id)
    SELECT ${sqlStr(gotrueId)}::uuid, ${sqlStr(code)}, ${sqlStr(name)}, ${sqlStr(email)},
      (SELECT id FROM public.positions   WHERE code = 999),
      (SELECT id FROM public.divisions   WHERE code = 'HQ'),
      (SELECT id FROM public.departments WHERE code = 'DEPT1'),
      (SELECT id FROM public.sections    WHERE code = 'SEC1');
  `);
} catch (e) {
  // DB insert 失敗時は GoTrue 側を掃除して orphan を残さない。
  console.error("public.users への insert に失敗。GoTrue identity を掃除します");
  try {
    execFileSync("docker", [
      "run",
      "--rm",
      "--network",
      network,
      "curlimages/curl:latest",
      "-s",
      "-X",
      "DELETE",
      `http://gotrue:9999/admin/users/${gotrueId}`,
      "-H",
      `authorization: Bearer ${mintServiceRoleToken()}`,
    ]);
  } catch {
    console.error(`GoTrue orphan cleanup 失敗: gotrue_id=${gotrueId}（手動削除してください）`);
  }
  die(`insert に失敗しました: ${e.message}`);
}

console.log("\n✓ 初期 admin を作成しました（この情報は一度だけ表示されます）");
console.log("────────────────────────────────────");
console.log(`  email    : ${email}`);
console.log(`  password : ${password}`);
console.log("────────────────────────────────────");
console.log("初回ログイン後にパスワードを変更してください。");
