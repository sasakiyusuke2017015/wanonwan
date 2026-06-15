import { NextResponse } from "next/server";
import { ReorderQuestionsSchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// 設問の並び替え（order = question id の並び）。RLS survey_questions_write = admin。
export const PUT = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;
  const surveyId = Number(id);

  const parsed = await parseBody(req, ReorderQuestionsSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    await withUser(claims.sub, async (tx) => {
      for (let i = 0; i < input.order.length; i++) {
        await tx`
          update public.survey_questions set sort_order = ${i + 1}
          where survey_id = ${surveyId} and question_id = ${input.order[i]}
        `;
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapDbError(e);
  }
});
