import "server-only";

import { SignJWT } from "jose";
import { randomBytes } from "node:crypto";
import { getGotrueJwtSecret } from "./env";

// GoTrue admin API(/admin/users)は service_role JWT を要求する。
// access_token と同じ GOTRUE_JWT_SECRET(HS256)で role=service_role のトークンを発行し、
// 短い有効期限（呼び出し直後に使い捨て）にする。サーバ内のみで生成し外部へ出さない。
export async function mintServiceRoleToken(): Promise<string> {
  const key = new TextEncoder().encode(getGotrueJwtSecret());
  return new SignJWT({ role: "service_role" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .setAudience("authenticated")
    .sign(key);
}

// 紛らわしい文字(0/O/1/l/I)を除いた英数字。管理者へ口頭/メモで渡す前提のため可読性優先。
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

const PASSWORD_LENGTH = 20;

// 初期パスワードをサーバ側で生成する（20 文字 ≈ 115bit）。
// 生成値はログに出さず、作成レスポンスで管理者へ一度だけ返す。
// modulo バイアスを避けるため rejection sampling（範囲外バイトは捨てる）。
export function generateInitialPassword(): string {
  const n = PASSWORD_ALPHABET.length;
  const limit = Math.floor(256 / n) * n; // この値以上のバイトは偏るので捨てる
  let out = "";
  while (out.length < PASSWORD_LENGTH) {
    const bytes = randomBytes(PASSWORD_LENGTH);
    for (let i = 0; i < bytes.length && out.length < PASSWORD_LENGTH; i++) {
      const b = bytes[i]!;
      if (b < limit) out += PASSWORD_ALPHABET[b % n];
    }
  }
  return out;
}
