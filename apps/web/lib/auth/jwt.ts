import { jwtVerify } from "jose";
import { getGotrueJwtSecret } from "./env";

let keyCache: Uint8Array | null = null;
function getKey(): Uint8Array {
  return (keyCache ??= new TextEncoder().encode(getGotrueJwtSecret()));
}

export interface AuthClaims {
  /** GoTrue user id (uuid)。RLS の app.user_id に注入する値。 */
  sub: string;
  email?: string;
  role?: string;
  exp: number;
}

// GoTrue の access_token（HS256, GOTRUE_JWT_SECRET 署名）を検証する。
// 失敗時は jose が例外を投げる（呼び出し側で 401 に変換）。
export async function verifyAccessToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
  return {
    sub: String(payload.sub ?? ""),
    email: typeof payload.email === "string" ? payload.email : undefined,
    role: typeof payload.role === "string" ? payload.role : undefined,
    exp: Number(payload.exp ?? 0),
  };
}
