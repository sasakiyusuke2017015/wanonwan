import { NextResponse } from "next/server";
import * as v from "valibot";
import { CreateQuestionSchema } from "@waoon/domain";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// 設問を更新（全項目。RLS questions_write = admin）。
export async function PUT(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;

  let input: v.InferOutput<typeof CreateQuestionSchema>;
  try {
    input = v.parse(CreateQuestionSchema, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

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
}

// 設問を削除（survey_questions リンクは FK CASCADE で消える）。
export async function DELETE(_req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
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
}
