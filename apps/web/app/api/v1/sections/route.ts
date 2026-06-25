import { NextResponse } from "next/server";
import { CreateSectionSchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { parseBody } from "@/lib/api/request";

// 課一覧（認証済みなら可）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(
    claims.sub,
    (tx) => tx`
      select id, code, name, department_id as "departmentId"
      from public.sections order by code
    `,
  );
  return NextResponse.json({ data: rows });
});

// 課作成（admin のみ。RLS が最終ガード）。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateSectionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        insert into public.sections (code, name, department_id)
        values (${input.code}, ${input.name}, ${input.departmentId})
        returning id, code, name, department_id as "departmentId"
      `,
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
});
