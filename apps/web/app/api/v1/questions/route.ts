import { NextResponse } from "next/server";
import { CreateQuestionSchema } from "@waoon/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

// 設問マスタ一覧（設問バンク。認証済みなら可。RLS questions_select）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(claims.sub, (tx) => tx`
    select id, body,
           answer_type     as "answerType",
           choices,
           required,
           has_extra_field as "hasExtraField",
           eval_item       as "evalItem"
    from public.questions
    order by id
  `);
  return NextResponse.json({ data: rows });
});

// 設問マスタへ新規作成（survey に紐づけないスタンドアロン。RLS questions_write = admin）。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateQuestionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      insert into public.questions (body, answer_type, choices, required, has_extra_field, eval_item)
      values (${input.body}, ${input.answerType}, ${tx.json(input.choices ?? [])},
              ${input.required ?? false}, ${input.hasExtraField ?? false}, ${input.evalItem ?? null})
      returning id, body, answer_type as "answerType", choices, required,
                has_extra_field as "hasExtraField", eval_item as "evalItem"
    `);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
});
