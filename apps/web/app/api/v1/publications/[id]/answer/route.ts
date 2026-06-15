import { NextResponse } from "next/server";
import * as v from "valibot";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

const AnswerBody = v.object({
  // questionId -> 回答値（単一 or 複数）
  answers: v.record(v.string(), v.union([v.string(), v.array(v.string())])),
});

// 回答提出（実施中の掲載に対し、本人の回答を upsert）。RLS: insert with check respondent = self。
export async function POST(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;
  const pid = Number(id);

  const parsed = await parseBody(req, AnswerBody);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const outcome = await withUser(claims.sub, async (tx) => {
      const [pub] = await tx`select status from public.survey_publications where id = ${pid}`;
      if (!pub) return { kind: "notfound" as const };
      if (pub.status !== 200) return { kind: "closed" as const };

      const [{ uid }] = await tx`select app.uid() as uid`;
      if (uid == null) return { kind: "nouser" as const };

      const existing = await tx`
        select id from public.answers where publication_id = ${pid} and respondent_id = ${uid}
      `;
      if (existing.length > 0) {
        await tx`
          update public.answers
          set answer_json = ${tx.json(input.answers)}, status = 200, answered_at = now(), updated_at = now()
          where id = ${existing[0].id}
        `;
        return { kind: "ok" as const, id: existing[0].id };
      }
      const [created] = await tx`
        insert into public.answers (publication_id, respondent_id, status, answer_json, answered_at)
        values (${pid}, ${uid}, 200, ${tx.json(input.answers)}, now())
        returning id
      `;
      return { kind: "ok" as const, id: created.id };
    });

    switch (outcome.kind) {
      case "ok":
        return NextResponse.json({ data: { answerId: outcome.id } }, { status: 201 });
      case "notfound":
        return NextResponse.json({ error: "アンケートが見つかりません" }, { status: 404 });
      case "closed":
        return NextResponse.json({ error: "このアンケートは受付期間外です" }, { status: 409 });
      case "nouser":
        return NextResponse.json({ error: "ユーザー登録が見つかりません" }, { status: 403 });
    }
  } catch (e) {
    return mapDbError(e);
  }
}
