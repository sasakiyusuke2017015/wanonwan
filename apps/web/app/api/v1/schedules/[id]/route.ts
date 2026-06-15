import { NextResponse } from "next/server";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { ScheduleBody } from "../route";

type Ctx = { params: Promise<{ id: string }> };

// 予定の更新。RLS(schedules_write)で admin or 作成者のみ（他人の行は 0 件更新 = 404）。
export async function PUT(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;

  const parsed = await parseBody(req, ScheduleBody);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        update public.schedules set
          title = ${input.title ?? null}, body = ${input.body ?? null},
          start_at = ${input.startAt}, end_at = ${input.endAt},
          all_day = ${input.allDay ?? false}, color = ${input.color ?? null},
          icon = ${input.icon ?? null}, event_type = ${input.eventType ?? null}
        where id = ${Number(id)}
        returning id, title, body,
                  start_at as "startAt", end_at as "endAt",
                  all_day  as "allDay", color, icon, event_type as "eventType"
      `,
    );
    if (rows.length === 0) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    return mapDbError(e);
  }
}

// 予定の削除。RLS で admin or 作成者のみ（他人の行は 0 件削除 = 404）。
export async function DELETE(_req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;

  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`delete from public.schedules where id = ${Number(id)} returning id`,
    );
    if (rows.length === 0) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapDbError(e);
  }
}
