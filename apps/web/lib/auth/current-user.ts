import "server-only";
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
