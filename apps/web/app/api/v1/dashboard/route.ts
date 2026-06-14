import { NextResponse } from "next/server";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";

// ダッシュボード集計。RLS(answers_select)でスコープされるため、admin は全件、
// それ以外は自分が回答者/面談者/閲覧者の answer のみが集計対象になる。
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;

  const data = await withUser(claims.sub, async (tx) => {
    const [summary] = await tx`
      select
        count(*)::int                                            as total,
        count(*) filter (where status = 100)::int                as status_100,
        count(*) filter (where status = 200)::int                as status_200,
        count(*) filter (where status = 400)::int                as status_400,
        count(*) filter (where status = 900)::int                as status_900,
        count(*) filter (where interview_at is not null)::int    as interviewed,
        avg((evaluation->>'satisfaction')::numeric)              as eval_satisfaction,
        avg((evaluation->>'workload')::numeric)                  as eval_workload,
        avg((evaluation->>'environment')::numeric)               as eval_environment,
        avg((evaluation->>'relationship')::numeric)              as eval_relationship,
        avg((evaluation->>'stress')::numeric)                    as eval_stress
      from public.answers
    `;
    const health = await tx`
      select health_status as status, count(*)::int as count
      from public.answers
      where health_status is not null
      group by health_status
      order by health_status
    `;
    return { summary, health };
  });

  const s = data.summary as Record<string, string | number | null>;
  const num = (v: string | number | null) => (v == null ? null : Number(v));

  return NextResponse.json({
    data: {
      total: Number(s.total),
      interviewed: Number(s.interviewed),
      byStatus: {
        100: Number(s.status_100),
        200: Number(s.status_200),
        400: Number(s.status_400),
        900: Number(s.status_900),
      },
      health: (data.health as unknown as { status: number; count: number }[]).map((h) => ({
        status: Number(h.status),
        count: Number(h.count),
      })),
      evaluation: {
        satisfaction: num(s.eval_satisfaction),
        workload: num(s.eval_workload),
        environment: num(s.eval_environment),
        relationship: num(s.eval_relationship),
        stress: num(s.eval_stress),
      },
    },
  });
}
