import { NextResponse } from "next/server";
import * as v from "valibot";
import { GoTrueError } from "@waoon/auth";
import { gotrue } from "@/lib/auth/gotrue";
import { setSession } from "@/lib/auth/session";
import { parseBody } from "@/lib/api/request";
import { AUTH_RATE_LIMITS, getClientIp, rateLimit, tooManyRequests } from "@/lib/auth/rate-limit";

const LoginBody = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(1)),
});

export async function POST(req: Request) {
  // ブルートフォース緩和: IP 単位でログイン試行を制限（成功/失敗どちらも計上）。
  const ip = getClientIp(req);
  const limit = rateLimit(`login:ip:${ip}`, AUTH_RATE_LIMITS.loginPerIp, AUTH_RATE_LIMITS.windowMs);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  const parsed = await parseBody(req, LoginBody, "メールアドレスとパスワードを入力してください");
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const session = await gotrue.signInWithPassword(input.email, input.password);
    await setSession(session);
    return NextResponse.json({
      user: { id: session.user.id, email: session.user.email, role: session.user.role },
    });
  } catch (error) {
    if (error instanceof GoTrueError) {
      // 認証失敗の詳細はクライアントへ出さない（汎用メッセージ）
      const status = error.status === 400 || error.status === 401 ? 401 : 502;
      return NextResponse.json(
        {
          error:
            status === 401
              ? "メールアドレスまたはパスワードが違います"
              : "認証サーバに接続できません",
        },
        { status },
      );
    }
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 500 });
  }
}
