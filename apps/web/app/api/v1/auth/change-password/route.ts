import { NextResponse } from "next/server";
import * as v from "valibot";
import { GoTrueError } from "@waoon/auth";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { gotrue } from "@/lib/auth/gotrue";
import { mintServiceRoleToken } from "@/lib/auth/provisioning";
import { mustChangeAppMetadata } from "@/lib/auth/metadata";
import { setSession } from "@/lib/auth/session";
import { parseBody } from "@/lib/api/request";
import { AUTH_RATE_LIMITS, getClientIp, rateLimit, tooManyRequests } from "@/lib/auth/rate-limit";

const Body = v.object({
  currentPassword: v.pipe(v.string(), v.minLength(1)),
  newPassword: v.pipe(v.string(), v.minLength(12, "パスワードは12文字以上にしてください")),
});

// 認証ユーザーが自分のパスワードを変更する。force-change（初回 PW 変更強制）の解除経路でもある。
// current PW を再確認してから更新し、app_metadata のフラグを解除、新 PW で再ログインして
// セッション（access+refresh）を新世代へ差し替える。これは allowlist で forceChangeGuard を掛けない。
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(
    `change-password:ip:${ip}`,
    AUTH_RATE_LIMITS.loginPerIp,
    AUTH_RATE_LIMITS.windowMs,
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  // current PW 確認に email が要る。欠落トークンは異常系として再ログインへ。
  if (!claims.email) return NextResponse.json({ error: "再ログインしてください" }, { status: 401 });
  const email = claims.email;

  const parsed = await parseBody(req, Body, "現在のパスワードと新しいパスワード（12文字以上）を入力してください");
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  // 1) current PW 確認（本人確認）。失敗は 401（汎用）。
  try {
    await gotrue.signInWithPassword(email, input.currentPassword);
  } catch (e) {
    if (e instanceof GoTrueError) {
      return NextResponse.json({ error: "現在のパスワードが違います" }, { status: 401 });
    }
    return NextResponse.json({ error: "認証サーバに接続できません" }, { status: 502 });
  }

  // 2) PW 更新 + フラグ解除（service_role）。ここで変更は確定。
  try {
    const token = await mintServiceRoleToken();
    await gotrue.admin.updateUser(
      claims.sub,
      { password: input.newPassword, appMetadata: mustChangeAppMetadata(false) },
      token,
    );
  } catch (e) {
    console.error(`change-password update failed: sub=${claims.sub}`, e instanceof GoTrueError ? e.status : e);
    return NextResponse.json({ error: "パスワードの変更に失敗しました" }, { status: 502 });
  }

  // 3) 新 PW で再ログインしてフラグ無しの新セッションへ差し替える（best-effort）。
  //    ここで失敗しても PW は既に変わっているので「変更完了・再ログイン要」を返す。
  try {
    const session = await gotrue.signInWithPassword(email, input.newPassword);
    await setSession(session);
  } catch (e) {
    console.error(`change-password re-login failed: sub=${claims.sub}`, e instanceof GoTrueError ? e.status : e);
    return NextResponse.json({ ok: true, reauth: true });
  }

  return NextResponse.json({ ok: true });
}
