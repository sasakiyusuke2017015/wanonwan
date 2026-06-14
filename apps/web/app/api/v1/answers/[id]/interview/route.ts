import { NextResponse } from "next/server";
import * as v from "valibot";
import { RecordInterviewSchema } from "@waoon/domain";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

const nz = (s: string | null | undefined) => (s ? s : null);

// 面談を記録（RLS answers_update = admin / 面談者 / 本人）。
// interviewer_id 未設定なら記録者を面談者に設定する（admin が claim する経路）。
export async function PUT(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;
  const aid = Number(id);

  let input: v.InferOutput<typeof RecordInterviewSchema>;
  try {
    input = v.parse(RecordInterviewSchema, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  try {
    const outcome = await withUser(claims.sub, async (tx) => {
      // 主認可（API 層）: 面談を記録できるのは admin か当該回答の面談者のみ。
      // RLS は本人(回答者)も行更新を許すため、ここで回答者を除外する。
      const [row] = await tx`
        select app.is_admin() as "isAdmin", app.uid() as uid, interviewer_id as "interviewerId"
        from public.answers where id = ${aid}
      `;
      if (!row) return { kind: "notfound" as const };
      const isInterviewer = row.interviewerId != null && String(row.interviewerId) === String(row.uid);
      if (!row.isAdmin && !isInterviewer) return { kind: "forbidden" as const };

      const [updated] = await tx`
        update public.answers set
          interviewer_id   = coalesce(interviewer_id, app.uid()),
          interview_at     = ${nz(input.interviewAt)},
          interview_method = ${input.interviewMethod ?? null},
          health_status    = ${input.healthStatus ?? null},
          evaluation       = ${tx.json(input.evaluation ?? {})},
          interview_memo   = ${nz(input.interviewMemo)},
          next_action      = ${nz(input.nextAction)},
          status           = ${input.status ?? 900},
          updated_at       = now()
        where id = ${aid}
        returning id, status
      `;
      return { kind: "ok" as const, row: updated };
    });

    if (outcome.kind === "notfound") return NextResponse.json({ error: "not found" }, { status: 404 });
    if (outcome.kind === "forbidden")
      return NextResponse.json({ error: "面談を記録する権限がありません" }, { status: 403 });
    return NextResponse.json({ data: outcome.row });
  } catch (e) {
    return mapDbError(e);
  }
}
