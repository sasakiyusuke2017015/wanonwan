import { NextResponse } from "next/server";
import { GoTrueError } from "@waoon/auth";
import { gotrue } from "@/lib/auth/gotrue";
import { clearSession, getRefreshToken, setSession } from "@/lib/auth/session";
import { AUTH_RATE_LIMITS, getClientIp, rateLimit, tooManyRequests } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  // refresh トークンの総当たり/濫用緩和（IP 単位）。
  const ip = getClientIp(req);
  const limit = rateLimit(
    `refresh:ip:${ip}`,
    AUTH_RATE_LIMITS.refreshPerIp,
    AUTH_RATE_LIMITS.windowMs,
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    const session = await gotrue.refresh(refreshToken);
    await setSession(session);
    return NextResponse.json({
      user: { id: session.user.id, email: session.user.email, role: session.user.role },
    });
  } catch (error) {
    await clearSession();
    if (error instanceof GoTrueError) {
      return NextResponse.json({ error: "セッションの更新に失敗しました" }, { status: 401 });
    }
    return NextResponse.json({ error: "セッション更新でエラーが発生しました" }, { status: 500 });
  }
}
