import { NextResponse } from "next/server";
import { CreateQuestionSchema } from "@waoon/domain";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// アンケートの設問一覧（sort_order 順）。
export async function GET(_req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;

  const rows = await withUser(claims.sub, (tx) => tx`
    select q.id, q.body,
           q.answer_type     as "answerType",
           q.choices,
           q.required,
           q.has_extra_field as "hasExtraField",
           q.eval_item       as "evalItem",
           sq.sort_order     as "sortOrder"
    from public.questions q
    join public.survey_questions sq on sq.question_id = q.id
    where sq.survey_id = ${Number(id)}
    order by sq.sort_order, q.id
  `);
  return NextResponse.json({ data: rows });
}

// 設問を追加（question 作成 + survey_questions リンク）。RLS write = admin。
export async function POST(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;
  const surveyId = Number(id);

  const parsed = await parseBody(req, CreateQuestionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const result = await withUser(claims.sub, async (tx) => {
      const [q] = await tx`
        insert into public.questions (body, answer_type, choices, required, has_extra_field, eval_item)
        values (${input.body}, ${input.answerType}, ${tx.json(input.choices ?? [])},
                ${input.required ?? false}, ${input.hasExtraField ?? false}, ${input.evalItem ?? null})
        returning id, body, answer_type as "answerType", choices, required,
                  has_extra_field as "hasExtraField", eval_item as "evalItem"
      `;
      const [{ next }] = await tx`
        select coalesce(max(sort_order), 0) + 1 as next
        from public.survey_questions where survey_id = ${surveyId}
      `;
      await tx`
        insert into public.survey_questions (survey_id, question_id, sort_order)
        values (${surveyId}, ${q.id}, ${next})
      `;
      return { ...q, sortOrder: next };
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
}
