import { NextResponse } from "next/server";
import * as v from "valibot";
import { ReorderQuestionsSchema } from "@waoon/domain";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// 設問の並び替え（order = question id の並び）。RLS survey_questions_write = admin。
export async function PUT(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const surveyId = Number(id);

  let input: v.InferOutput<typeof ReorderQuestionsSchema>;
  try {
    input = v.parse(ReorderQuestionsSchema, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

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
}
