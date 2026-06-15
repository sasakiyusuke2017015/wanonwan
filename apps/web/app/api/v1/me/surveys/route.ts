import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";

// 回答者向け: 実施中(200)の掲載一覧 + 自分の回答状態。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(claims.sub, (tx) => tx`
    select p.id        as "publicationId",
           p.title     as "publicationTitle",
           p.status,
           p.start_at  as "startAt",
           p.end_at    as "endAt",
           s.id        as "surveyId",
           s.title     as "surveyTitle",
           a.id        as "answerId",
           a.status    as "answerStatus"
    from public.survey_publications p
    join public.surveys s on s.id = p.survey_id
    left join public.answers a
      on a.publication_id = p.id and a.respondent_id = app.uid()
    where p.status = 200
    order by p.id desc
  `);
  return NextResponse.json({ data: rows });
});
