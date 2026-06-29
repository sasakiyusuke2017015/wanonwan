import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";

type Ctx = { params: Promise<{ id: string }> };

// 回答詳細 + 設問（回答内容の表示用）+ 面談フィールド。
export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  const aid = Number(id);

  const result = await withUser(claims.sub, async (tx) => {
    const [answer] = await tx`
      select a.id, a.status,
             a.answer_json      as "answerJson",
             a.health_status    as "healthStatus",
             a.interview_method as "interviewMethod",
             a.interview_at     as "interviewAt",
             a.interview_memo   as "interviewMemo",
             a.next_action      as "nextAction",
             a.urgency_id       as "urgencyId",
             a.evaluation,
             u.name             as "respondentName",
             s.id               as "surveyId",
             s.title            as "surveyTitle",
             p.title            as "publicationTitle"
      from public.answers a
      join public.users u               on u.id = a.respondent_id
      join public.survey_publications p on p.id = a.publication_id
      join public.surveys s             on s.id = p.survey_id
      where a.id = ${aid}
    `;
    if (!answer) return null;

    const questions = await tx`
      select q.id, q.body, q.answer_type as "answerType"
      from public.survey_questions sq
      join public.questions q on q.id = sq.question_id
      where sq.survey_id = ${answer.surveyId}
      order by sq.sort_order, q.id
    `;
    return { answer, questions };
  });

  if (!result) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: result });
});
