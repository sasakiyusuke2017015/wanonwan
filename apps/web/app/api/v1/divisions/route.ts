import { NextResponse } from "next/server";
import { CreateDivisionSchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { parseBody } from "@/lib/api/request";

// 本部一覧（認証済みなら可。RLS divisions_select）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(
    claims.sub,
    (tx) => tx`select id, code, name from public.divisions order by code`,
  );
  return NextResponse.json({ data: rows });
});

// 本部作成（admin のみ。RLS divisions_write WITH CHECK が最終ガード）。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateDivisionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        insert into public.divisions (code, name)
        values (${input.code}, ${input.name})
        returning id, code, name
      `,
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
});
