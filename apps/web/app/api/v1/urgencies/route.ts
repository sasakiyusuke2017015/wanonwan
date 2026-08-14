import { NextResponse } from "next/server";
import { CreateUrgencySchema } from "@wanonwan/domain";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { parseBody } from "@/lib/api/request";

// 緊急度一覧（認証済みなら可）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(
    claims.sub,
    (tx) => tx`select id, code, name from public.urgency_levels order by code`,
  );
  return NextResponse.json({ data: rows });
});

// 緊急度作成（admin のみ。RLS questions と同じマスタ系 write = admin）。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateUrgencySchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        insert into public.urgency_levels (code, name)
        values (${input.code}, ${input.name})
        returning id, code, name
      `,
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
});
