import { NextResponse } from "next/server";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";

// 回答者向け: 実施中(200)の掲載一覧 + 自分の回答状態。
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;

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
}
