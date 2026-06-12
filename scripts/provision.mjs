// prod/stg を空状態から初期化する（B-6）。
//   1) 組織マスタ seed（00_org.sql）だけを適用（手書き UUID のユーザー seed は流さない）
//   2) admin 1 名を GoTrue admin API で発行 → public.users に gotrue_id 付きで紐付け
//   3) 初期パスワードを一度だけ表示
//
// 使い方（host で実行。stack 起動 + migration 適用後）:
//   先に compose:*:migrate を流して public.users 等のテーブルを作っておくこと（未適用だと参照で落ちる）。
//   node scripts/provision.mjs --compose-file infra/docker-compose.prod.yml --env-file infra/.env.prod --email admin@your-domain.jp
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

function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function resolvePath(p) {
  return isAbsolute(p) ? p : join(root, p);
}
function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const composeFileRel = flag("compose-file") ?? "infra/docker-compose.prod.yml";
const composeFile = resolvePath(composeFileRel);
const envFile = resolvePath(flag("env-file") ?? "infra/.env.prod");
const email = flag("email");
const name = flag("name") ?? "管理者";
const code = flag("code") ?? "admin";
// compose ネットワーク名（networks.waoon.name）。prod→waoon-prod / stg→waoon-stg。
const network = flag("network") ?? (composeFileRel.includes("prod") ? "waoon-prod" : "waoon-stg");

if (!email) die("--email は必須です（初期 admin のメールアドレス）");

const env = parseEnvFile(envFile);
const PG_SUPERUSER = env.PG_SUPERUSER || "postgres";
const PG_DATABASE = env.PG_DATABASE || "waoon";
const JWT_SECRET = env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.includes("dev-only-change-me")) {
  die("JWT_SECRET が未設定か dev 値です。先に check:secrets を通してください");
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
function psql(sql, { capture = false } = {}) {
  const args = [
    "compose", "--env-file", envFile, "-f", composeFile,
    "exec", "-T", "postgres",
    "psql", "-v", "ON_ERROR_STOP=1", "-U", PG_SUPERUSER, "-d", PG_DATABASE,
  ];
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
psql(readFileSync(join(root, "outputs", "infra-data", "seed", "00_org.sql"), "utf8"));

// --- 既存 admin チェック（GoTrue 重複作成を避ける） ---
const exists = psql(`SELECT count(*) FROM public.users WHERE email = ${sqlStr(email)};`, {
  capture: true,
}).trim();
if (exists !== "0") {
  die(`${email} は既に public.users に存在します。provisioning を中止しました`);
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
      "run", "--rm", "--network", network, "curlimages/curl:latest",
      "-s", "--fail-with-body", "-X", "POST",
      "http://gotrue:9999/admin/users",
      "-H", `authorization: Bearer ${token}`,
      "-H", "content-type: application/json",
      "-d", body,
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
      "run", "--rm", "--network", network, "curlimages/curl:latest",
      "-s", "-X", "DELETE", `http://gotrue:9999/admin/users/${gotrueId}`,
      "-H", `authorization: Bearer ${mintServiceRoleToken()}`,
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
