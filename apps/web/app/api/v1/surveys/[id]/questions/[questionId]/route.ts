import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string; questionId: string }> };

// アンケートからの「外す」= リンク解除。survey_questions の該当 1 行のみ削除する。
// 設問マスタ本体(questions)と他アンケートのリンクは残す（マスタ削除は /questions/[id] DELETE 側）。
export const DELETE = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id, questionId } = await params;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      delete from public.survey_questions
      where survey_id = ${Number(id)} and question_id = ${Number(questionId)}
      returning question_id
    `);
    if (rows.length === 0) {
      return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapDbError(e);
  }
});
