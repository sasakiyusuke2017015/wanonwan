import { NextResponse } from "next/server";
import { CreateSurveySchema } from "@wanonwan/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

// アンケート一覧（認証済みは閲覧可。RLS surveys_select）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(claims.sub, (tx) => tx`
    select s.id, s.title, s.status, s.capacity,
           s.requires_auth as "requiresAuth",
           s.uses_ai       as "usesAi",
           ul.name         as "urgencyName",
           ul.code::int    as "urgencyCode",
           (select count(*) from public.survey_publications p where p.survey_id = s.id)::int as "publicationCount"
    from public.surveys s
    left join public.urgency_levels ul on ul.id = s.urgency_id
    order by s.id desc
  `);
  return NextResponse.json({ data: rows });
});

// アンケート新規作成（RLS surveys_write = admin のみ）。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateSurveySchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      insert into public.surveys (title, status, capacity, requires_auth, uses_ai, urgency_id)
      values (${input.title}, ${input.status ?? "draft"}, ${input.capacity ?? null},
              ${input.requiresAuth ?? true}, ${input.usesAi ?? false}, ${input.urgencyId ?? null})
      returning id, title, status
    `);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
});
