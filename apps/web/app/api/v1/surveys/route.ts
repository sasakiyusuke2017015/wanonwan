import { NextResponse } from "next/server";
import * as v from "valibot";
import { CreateSurveySchema } from "@waoon/domain";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

// アンケート一覧（認証済みは閲覧可。RLS surveys_select）。
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;

  const rows = await withUser(claims.sub, (tx) => tx`
    select s.id, s.title, s.status, s.capacity,
           s.requires_auth as "requiresAuth",
           s.uses_ai       as "usesAi",
           (select count(*) from public.survey_publications p where p.survey_id = s.id)::int as "publicationCount"
    from public.surveys s
    order by s.id desc
  `);
  return NextResponse.json({ data: rows });
}

// アンケート新規作成（RLS surveys_write = admin のみ）。
export async function POST(req: Request) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;

  let input: v.InferOutput<typeof CreateSurveySchema>;
  try {
    input = v.parse(CreateSurveySchema, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      insert into public.surveys (title, status, capacity, requires_auth, uses_ai)
      values (${input.title}, ${input.status ?? "draft"}, ${input.capacity ?? null},
              ${input.requiresAuth ?? true}, ${input.usesAi ?? false})
      returning id, title, status
    `);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
}
