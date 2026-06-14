import "server-only";
import { NextResponse } from "next/server";
import { verifyAccessToken, type AuthClaims } from "./jwt";
import { getAccessToken } from "./session";

// 現在のリクエストの認証クレーム（未認証/失効なら null）。
export async function getCurrentClaims(): Promise<AuthClaims | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

// force-change ゲート（enforcement の主体）。パスワード強制変更フラグが立つユーザーは、
// allowlist（auth/change-password・auth/logout・auth/me）以外の業務 API を 403 で弾く。
// 各業務 route が getCurrentClaims の直後に呼ぶ。フラグが無ければ null を返す。
export function forceChangeGuard(claims: AuthClaims): NextResponse | null {
  if (!claims.mustChangePassword) return null;
  return NextResponse.json(
    { error: "パスワードの変更が必要です", code: "must_change_password" },
    { status: 403 },
  );
}
