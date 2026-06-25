import { NextResponse } from "next/server";
import { CreatePositionSchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { parseBody } from "@/lib/api/request";

// 役職一覧（認証済みなら可）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(
    claims.sub,
    (tx) => tx`select id, code, name from public.positions order by code`,
  );
  return NextResponse.json({ data: rows });
});

// 役職作成（admin のみ。code 990-999 は CreatePositionSchema + RLS WITH CHECK で二重に拒否）。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreatePositionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        insert into public.positions (code, name)
        values (${input.code}, ${input.name})
        returning id, code, name
      `,
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
});
