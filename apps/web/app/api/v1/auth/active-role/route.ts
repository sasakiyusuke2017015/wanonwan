import { NextResponse } from "next/server";
import { SetActiveRoleSchema, heldRoles, type ElevatedRole } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { setActiveRoleCookie } from "@/lib/auth/session";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

// アクティブロール（視点）の切替。保有ロールのみ許可し httpOnly cookie に保存する。
// 認可には使わない表示状態（認可は保有ロールの union。RLS / 各 API が判定する）。
export const PUT = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, SetActiveRoleSchema);
  if (parsed instanceof NextResponse) return parsed;

  try {
    const [row] = await withUser(claims.sub, (tx) => tx`
      select coalesce(
        (select array_agg(ur.role) from public.user_roles ur where ur.user_id = app.uid()),
        '{}'
      ) as elevated
    `);
    const roles = heldRoles((row?.elevated ?? []) as ElevatedRole[]);
    if (!roles.includes(parsed.role)) {
      return NextResponse.json(
        { error: "保有していないロールには切り替えられません" },
        { status: 422 },
      );
    }
    await setActiveRoleCookie(parsed.role);
    return NextResponse.json({ data: { activeRole: parsed.role } });
  } catch (e) {
    return mapDbError(e);
  }
});
