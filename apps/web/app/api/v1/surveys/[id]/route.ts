import { NextResponse } from "next/server";
import { UpdateSurveySchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;

  const rows = await withUser(claims.sub, (tx) => tx`
    select id, title, status, capacity,
           requires_auth as "requiresAuth",
           uses_ai       as "usesAi",
           urgency_id::int as "urgencyId"
    from public.surveys where id = ${Number(id)}
  `);
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: rows[0] });
});

export const PUT = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;

  const parsed = await parseBody(req, UpdateSurveySchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  const set: Record<string, unknown> = {};
  if (input.title !== undefined) set.title = input.title;
  if (input.status !== undefined) set.status = input.status;
  if (input.capacity !== undefined) set.capacity = input.capacity;
  if (input.requiresAuth !== undefined) set.requires_auth = input.requiresAuth;
  if (input.usesAi !== undefined) set.uses_ai = input.usesAi;
  if (input.urgencyId !== undefined) set.urgency_id = input.urgencyId;
  if (Object.keys(set).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      update public.surveys set ${tx(set)}, updated_at = now()
      where id = ${Number(id)}
      returning id, title, status
    `);
    if (rows.length === 0) return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    return mapDbError(e);
  }
});
