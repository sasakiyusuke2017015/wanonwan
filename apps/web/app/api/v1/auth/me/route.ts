import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessToken } from "@/lib/auth/session";
import { withUser } from "@/lib/db/client";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  let claims;
  try {
    claims = await verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  // 業務側の属性（isAdmin / 業務ユーザーid / 表示名）を RLS コンテキストで解決
  const [row] = await withUser(claims.sub, (tx) => tx`
    select app.is_admin() as "isAdmin",
           app.uid()      as "userId",
           (select name from public.users where gotrue_id = app.current_user_id()) as name
  `);

  return NextResponse.json({
    user: { id: claims.sub, email: claims.email, role: claims.role },
    userId: row?.userId ?? null,
    name: row?.name ?? null,
    isAdmin: row?.isAdmin ?? false,
  });
}
