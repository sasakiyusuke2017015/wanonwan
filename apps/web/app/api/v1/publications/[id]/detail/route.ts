import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";

type Ctx = { params: Promise<{ id: string }> };

// 回答画面用: 掲載 + アンケート + 設問 + 自分の既存回答。
export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  const pid = Number(id);

  const result = await withUser(claims.sub, async (tx) => {
    const [publication] = await tx`
      select p.id as "publicationId", p.title as "publicationTitle", p.status,
             s.id as "surveyId", s.title as "surveyTitle"
      from public.survey_publications p
      join public.surveys s on s.id = p.survey_id
      where p.id = ${pid}
    `;
    if (!publication) return null;

    const questions = await tx`
      select q.id, q.body, q.answer_type as "answerType", q.choices,
             q.required, q.has_extra_field as "hasExtraField", sq.sort_order as "sortOrder"
      from public.survey_questions sq
      join public.questions q on q.id = sq.question_id
      where sq.survey_id = ${publication.surveyId}
      order by sq.sort_order, q.id
    `;

    const [answer] = await tx`
      select id, status, answer_json as "answerJson"
      from public.answers
      where publication_id = ${pid} and respondent_id = app.uid()
    `;

    return { publication, questions, answer: answer ?? null };
  });

  if (!result) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: result });
});
