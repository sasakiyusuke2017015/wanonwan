import { NextResponse } from "next/server";
import { CreatePublicationSchema } from "@wanonwan/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

const nz = (s: string | null | undefined) => (s ? s : null);

export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;

  const rows = await withUser(claims.sub, (tx) => tx`
    select id, title, body, status,
           start_at as "startAt", end_at as "endAt"
    from public.survey_publications
    where survey_id = ${Number(id)}
    order by id desc
  `);
  return NextResponse.json({ data: rows });
});

export const POST = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;

  const parsed = await parseBody(req, CreatePublicationSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      insert into public.survey_publications (survey_id, title, body, status, start_at, end_at)
      values (${Number(id)}, ${nz(input.title)}, ${nz(input.body)}, ${input.status ?? 100},
              ${nz(input.startAt)}, ${nz(input.endAt)})
      returning id, title, body, status, start_at as "startAt", end_at as "endAt"
    `);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
});
