// dev の GoTrue ユーザを冪等に作成する（dev 専用）。
//
// db:seed は public.users（gotrue_id 固定 UUID）だけを作るため、GoTrue 側の
// auth.users を別途作らないとログインできない。本スクリプトは GoTrue admin API を
// seed/10_users.sql と同じ固定 UUID + email で叩き、クリーンな pnpm dev:up から
// ログインできる状態にする。
//
// stg/prod は scripts/provision.mjs（ランダム PW・別管理）を使う。本スクリプトは
// localhost の dev GoTrue 以外を対象にしない（下記の多層ガード）。
//
// 使い方: pnpm seed:gotrue:dev（GoTrue が healthy であること。dev:up が --wait で担保）
import { createHmac } from "node:crypto";

const GOTRUE_URL = process.env.GOTRUE_URL ?? "http://localhost:9999";

// dev 専用ガード①: localhost 以外は拒否。stg/prod の GoTrue は compose 内部のみで
// localhost には出ないため、これで本番誤爆を防ぐ。
const host = new URL(GOTRUE_URL).hostname;
if (host !== "localhost" && host !== "127.0.0.1") {
  console.error(`✗ dev 専用です。GOTRUE_URL=${GOTRUE_URL} は localhost ではありません。`);
  process.exit(1);
}

// dev secret（compose 既定 ${JWT_SECRET:-dev-only-change-me-...}）。
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-me-please-32bytes-minimum";

// dev 専用ガード②: dev 値以外なら拒否（provision.mjs の「dev 値を拒否」と対のガード）。
if (!JWT_SECRET.includes("dev-only-change-me")) {
  console.error(
    "✗ JWT_SECRET が dev 既定値ではありません。本スクリプトは dev 専用です（stg/prod は provision.mjs）。",
  );
  process.exit(1);
}

// seed/10_users.sql と一致する固定 UUID。パスワードは dev 専用の固定値（平文で良い＝dev 限定。
// stg/prod は provision.mjs のランダム PW で別管理）。
const USERS = [
  {
    id: "cb427b54-eaef-47df-916b-626321d23dc9",
    email: "admin@example.com",
    password: "Admin1234!",
    name: "管理者",
  },
  {
    id: "00000000-0000-0000-0000-0000000a11ce",
    email: "alice@example.com",
    password: "Alice1234!",
    name: "アリス",
  },
  {
    id: "00000000-0000-0000-0000-0000000b0b00",
    email: "bob@example.com",
    password: "Bob1234!",
    name: "ボブ",
  },
  {
    id: "00000000-0000-0000-0000-0000000ca201",
    email: "carol@example.com",
    password: "Carol1234!",
    name: "キャロル",
  },
];

const b64url = (s) => Buffer.from(s).toString("base64url");

// GoTrue admin API 用の service_role JWT（HS256, 60s）。provision.mjs と同形式。
function mintServiceRoleToken() {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(
    JSON.stringify({ role: "service_role", aud: "authenticated", iat: now, exp: now + 60 }),
  );
  const data = `${header}.${payload}`;
  const sig = createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

// 既存ユーザに対する応答だけをスキップ対象にする。弱い PW / バリデーション不正等の
// その他 422 は握りつぶさず失敗させる（ログインできない dev を「成功」と誤報告しない）。
function isAlreadyExists(status, body) {
  if (status !== 409 && status !== 422) return false;
  return /exist|already|registered|duplicate/i.test(body);
}

const token = mintServiceRoleToken();
let created = 0;
let skipped = 0;
for (const u of USERS) {
  let res;
  try {
    res = await fetch(`${GOTRUE_URL}/admin/users`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        id: u.id,
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name },
      }),
    });
  } catch (e) {
    console.error(`✗ GoTrue (${GOTRUE_URL}) へ接続できません: ${e.message}`);
    process.exit(1);
  }
  const body = await res.text();
  if (res.ok) {
    console.log(`• 作成: ${u.email}`);
    created++;
  } else if (isAlreadyExists(res.status, body)) {
    console.log(`• 既存（スキップ）: ${u.email}`);
    skipped++;
  } else {
    console.error(`✗ ${u.email} の作成に失敗 (HTTP ${res.status}): ${body.slice(0, 300)}`);
    process.exit(1);
  }
}
console.log(`done: GoTrue dev users — created ${created}, skipped ${skipped}`);
