import { NextResponse } from "next/server";
import { LinkQuestionSchema } from "@wanonwan/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// 既存のマスタ設問をアンケートへ追加（survey_questions に末尾 sort_order でリンク）。
// 新規設問の作成はしない（マスタには既にある）。RLS survey_questions_write = admin。
export const POST = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;
  const surveyId = Number(id);

  const parsed = await parseBody(req, LinkQuestionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const { questionId } = parsed;

  try {
    const result = await withUser(claims.sub, async (tx) => {
      const [{ next }] = await tx`
        select coalesce(max(sort_order), 0) + 1 as next
        from public.survey_questions where survey_id = ${surveyId}
      `;
      await tx`
        insert into public.survey_questions (survey_id, question_id, sort_order)
        values (${surveyId}, ${questionId}, ${next})
      `;
      return { surveyId, questionId, sortOrder: next };
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    // 同じ設問の二重リンクは PK(survey_id, question_id) 衝突 = 409。
    if ((e as { code?: string } | null)?.code === "23505") {
      return NextResponse.json({ error: "この設問は既に追加されています" }, { status: 409 });
    }
    return mapDbError(e);
  }
});
