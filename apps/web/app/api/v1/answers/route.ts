import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";

// 回答一覧（RLS で可視範囲が決まる: admin 全件 / 面談者 / 閲覧者 / 本人）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(claims.sub, (tx) => tx`
    select a.id, a.status,
           a.health_status as "healthStatus",
           a.interview_at  as "interviewAt",
           ul.name         as "urgencyName",
           ul.code::int    as "urgencyCode",
           u.name          as "respondentName",
           s.title         as "surveyTitle",
           p.title         as "publicationTitle"
    from public.answers a
    join public.users u               on u.id = a.respondent_id
    join public.survey_publications p on p.id = a.publication_id
    join public.surveys s             on s.id = p.survey_id
    left join public.urgency_levels ul on ul.id = a.urgency_id
    order by a.id desc
  `);
  return NextResponse.json({ data: rows });
});
