import { NextResponse } from "next/server";
import { GoTrueError } from "@waoon/auth";
import { gotrue } from "@/lib/auth/gotrue";
import { clearSession, getRefreshToken, setSession } from "@/lib/auth/session";

export async function POST() {
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
