import { NextResponse } from "next/server";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";

// フォームの選択肢用: 組織マスタ（本部/部/課/役職）。認証済みなら可。
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const data = await withUser(claims.sub, async (tx) => {
    // 単一接続トランザクションなので逐次で実行する
    const positions = await tx`select id, code, name from public.positions order by code`;
    const divisions = await tx`select id, code, name from public.divisions order by code`;
    const departments = await tx`select id, code, name, division_id as "divisionId" from public.departments order by code`;
    const sections = await tx`select id, code, name, department_id as "departmentId" from public.sections order by code`;
    return { positions, divisions, departments, sections };
  });

  return NextResponse.json({ data });
}
