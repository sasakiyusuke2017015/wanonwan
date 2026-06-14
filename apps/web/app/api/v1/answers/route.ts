import { NextResponse } from "next/server";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";

// 回答一覧（RLS で可視範囲が決まる: admin 全件 / 面談者 / 閲覧者 / 本人）。
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;

  const rows = await withUser(claims.sub, (tx) => tx`
    select a.id, a.status,
           a.health_status as "healthStatus",
           a.interview_at  as "interviewAt",
           u.name          as "respondentName",
           s.title         as "surveyTitle",
           p.title         as "publicationTitle"
    from public.answers a
    join public.users u               on u.id = a.respondent_id
    join public.survey_publications p on p.id = a.publication_id
    join public.surveys s             on s.id = p.survey_id
    order by a.id desc
  `);
  return NextResponse.json({ data: rows });
}
