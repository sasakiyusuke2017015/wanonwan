import { NextResponse } from "next/server";
import { CreateQuestionSchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// 設問を更新（全項目。RLS questions_write = admin）。
export const PUT = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;

  const parsed = await parseBody(req, CreateQuestionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      update public.questions set
        body            = ${input.body},
        answer_type     = ${input.answerType},
        choices         = ${tx.json(input.choices ?? [])},
        required        = ${input.required ?? false},
        has_extra_field = ${input.hasExtraField ?? false},
        eval_item       = ${input.evalItem ?? null}
      where id = ${Number(id)}
      returning id, body, answer_type as "answerType", choices, required,
                has_extra_field as "hasExtraField", eval_item as "evalItem"
    `);
    if (rows.length === 0) return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    return mapDbError(e);
  }
});

// 設問を削除（survey_questions リンクは FK CASCADE で消える）。
export const DELETE = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      delete from public.questions where id = ${Number(id)} returning id
    `);
    if (rows.length === 0) return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapDbError(e);
  }
});
