import { NextResponse } from "next/server";
import { heldRoles, resolveActiveRole, type ElevatedRole } from "@waoon/domain";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessToken, getActiveRoleCookie } from "@/lib/auth/session";
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

  // 業務側の属性（isAdmin / 業務ユーザーid / 表示名 / 保有ロール）を RLS コンテキストで解決
  const [row] = await withUser(claims.sub, (tx) => tx`
    select app.is_admin() as "isAdmin",
           app.uid()      as "userId",
           (select name from public.users where gotrue_id = app.current_user_id()) as name,
           coalesce(
             (select array_agg(ur.role order by ur.role) from public.user_roles ur where ur.user_id = app.uid()),
             '{}'
           ) as elevated
  `);

  // 業務ロールはトップレベル roles / activeRole。user.role は GoTrue JWT の
  // role（常に authenticated）で別物なので混同しない。
  // activeRole は cookie を信頼せず毎回保有集合と突合し、非包含なら破棄して
  // 最上位保有ロールへフォールバックする（表示状態であり認可には使わない）。
  const roles = heldRoles((row?.elevated ?? []) as ElevatedRole[]);
  const activeRole = resolveActiveRole(roles, await getActiveRoleCookie());

  return NextResponse.json({
    user: { id: claims.sub, email: claims.email, role: claims.role },
    userId: row?.userId ?? null,
    name: row?.name ?? null,
    isAdmin: row?.isAdmin ?? false,
    roles,
    activeRole,
  });
}
