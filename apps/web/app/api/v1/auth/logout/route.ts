import { NextResponse } from "next/server";
import { gotrue } from "@/lib/auth/gotrue";
import { clearSession, getAccessToken } from "@/lib/auth/session";

export async function POST() {
  const token = await getAccessToken();
  if (token) {
    // GoTrue 側の失効は best-effort（失敗してもクッキーは消す）
    try {
      await gotrue().signOut(token);
    } catch {
      // ignore
    }
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
