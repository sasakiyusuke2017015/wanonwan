import { NextResponse } from "next/server";
import { UpdatePublicationSchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

const nz = (s: string | null | undefined) => (s ? s : null);

// 掲載設定を更新（全項目。RLS survey_publications_write = admin）。
export const PUT = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;

  const parsed = await parseBody(req, UpdatePublicationSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      update public.survey_publications set
        title    = ${nz(input.title)},
        body     = ${nz(input.body)},
        status   = ${input.status ?? 100},
        start_at = ${nz(input.startAt)},
        end_at   = ${nz(input.endAt)},
        updated_at = now()
      where id = ${Number(id)}
      returning id, title, body, status, start_at as "startAt", end_at as "endAt"
    `);
    if (rows.length === 0) return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    return mapDbError(e);
  }
});

export const DELETE = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      delete from public.survey_publications where id = ${Number(id)} returning id
    `);
    if (rows.length === 0) return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapDbError(e);
  }
});
