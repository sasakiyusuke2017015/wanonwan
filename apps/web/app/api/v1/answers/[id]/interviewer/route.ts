import { NextResponse } from "next/server";
import { AssignInterviewerSchema } from "@wanonwan/domain";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// 面談担当の指名/解除（admin のみ。RLS answers_update(admin) が最終ガード）。
// 指名先の capability 検証（interviewer/admin 保有）と UPDATE を単一 SQL で行い、
// チェックと更新の間に降格が挟まる TOCTOU を排除する。
export const PUT = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;
  const aid = Number(id);

  const parsed = await parseBody(req, AssignInterviewerSchema);
  if (parsed instanceof NextResponse) return parsed;
  const { interviewerId } = parsed;

  try {
    const outcome = await withUser(claims.sub, async (tx) => {
      const [adminRow] = await tx`select app.is_admin() as ok`;
      if (!adminRow?.ok) return { kind: "forbidden" as const };

      const updated =
        interviewerId === null
          ? await tx`
              update public.answers set interviewer_id = null, updated_at = now()
              where id = ${aid}
              returning id, interviewer_id as "interviewerId"
            `
          : await tx`
              update public.answers set interviewer_id = ${interviewerId}, updated_at = now()
              where id = ${aid}
                and exists (
                  select 1 from public.user_roles
                  where user_id = ${interviewerId} and role in ('interviewer', 'admin')
                )
              returning id, interviewer_id as "interviewerId"
            `;
      if (updated.length > 0) return { kind: "ok" as const, row: updated[0] };

      // 0 行更新の原因を切り分ける（answer 不在 → 404 / 指名先が非保有 → 422）。
      const found = await tx`select 1 from public.answers where id = ${aid}`;
      return found.length === 0 ? { kind: "notfound" as const } : { kind: "ineligible" as const };
    });

    if (outcome.kind === "forbidden")
      return NextResponse.json({ error: "面談担当を割り当てる権限がありません" }, { status: 403 });
    if (outcome.kind === "notfound")
      return NextResponse.json({ error: "not found" }, { status: 404 });
    if (outcome.kind === "ineligible")
      return NextResponse.json(
        { error: "指名先が面談担当（または管理者）の権限を持っていません" },
        { status: 422 },
      );
    return NextResponse.json({ data: outcome.row });
  } catch (e) {
    return mapDbError(e);
  }
});
