// GoTrue admin API クライアント（service_role JWT + 使い捨て curl コンテナ）。
//
// GoTrue は compose ネットワーク内部にしか出ないため、ホストからは到達できない。
// そこで compose ネットワーク上に使い捨ての curl コンテナを立てて admin API を叩く。
// イメージはタグ固定にする（latest だと pull のたびに中身が変わり、CI の再現性を損なう）。
import { execFileSync } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";

const CURL_IMAGE = "curlimages/curl:8.11.1";

// dev の compose 既定値（`${JWT_SECRET:-...}`）。GoTrue はこの secret でトークンを検証するため、
// dev の逆ガード検査と署名は同一の const を参照する（別々に書くと片方だけ変えて 401 になる）。
export const DEV_JWT_SECRET = "dev-only-change-me-please-32bytes-minimum";

const base64url = (buf) => Buffer.from(buf).toString("base64url");

// GoTrue admin API 用の service_role JWT（HS256, 60s）。apps/web の provisioning.ts と同等。
function mintServiceRoleToken(jwtSecret) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({ role: "service_role", aud: "authenticated", iat: now, exp: now + 60 }),
  );
  const data = `${header}.${payload}`;
  const sig = createHmac("sha256", jwtSecret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

// 初期パスワード（20 文字・紛らわしい文字を除外・rejection sampling）。provisioning.ts と同等。
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generateInitialPassword() {
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

// token は呼び出しごとに発行する（60s 有効。N 名ループでの期限切れを避ける）。
export function createGoTrueClient({ network, jwtSecret }) {
  function request(method, path, bodyObj) {
    const args = [
      "run", "--rm", "--network", network, CURL_IMAGE,
      "-s", "--fail-with-body", "-X", method, `http://gotrue:9999${path}`,
      "-H", `authorization: Bearer ${mintServiceRoleToken(jwtSecret)}`,
    ];
    if (bodyObj !== undefined) {
      args.push("-H", "content-type: application/json", "-d", JSON.stringify(bodyObj));
    }
    return execFileSync("docker", args, { encoding: "utf8" });
  }

  return {
    // 発行した GoTrue user の id を返す。
    createUser(body) {
      const res = request("POST", "/admin/users", body);
      const id = JSON.parse(res).id;
      if (!id) throw new Error(`unexpected GoTrue response: ${res}`);
      return id;
    },
    deleteUser(id) {
      request("DELETE", `/admin/users/${id}`);
    },
  };
}
