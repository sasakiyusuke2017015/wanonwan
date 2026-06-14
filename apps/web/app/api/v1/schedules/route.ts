import { NextResponse } from "next/server";
import * as v from "valibot";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

// 予定の入出力。start_at/end_at は絶対時刻(ISO)。タイムゾーンはブラウザの Date が扱う。
export const ScheduleBody = v.object({
  title: v.optional(v.nullable(v.string())),
  startAt: v.pipe(v.string(), v.minLength(1)),
  endAt: v.pipe(v.string(), v.minLength(1)),
  allDay: v.optional(v.boolean()),
  color: v.optional(v.nullable(v.string())),
  body: v.optional(v.nullable(v.string())),
  icon: v.optional(v.nullable(v.string())),
  eventType: v.optional(v.nullable(v.string())),
});

// 予定一覧。RLS(schedules_select)で認証済みなら全件閲覧（共有カレンダー）。
// start_at が無い行はカレンダーに置けないため除外する。
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;

  const rows = await withUser(
    claims.sub,
    (tx) => tx`
      select id, title, body,
             start_at as "startAt", end_at as "endAt",
             all_day  as "allDay", color, icon, event_type as "eventType"
      from public.schedules
      where start_at is not null
      order by start_at
    `,
  );
  return NextResponse.json({ data: rows });
}

// 予定の新規作成。created_by は本人(app.uid())。RLS write は admin or created_by。
export async function POST(req: Request) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;

  let input: v.InferOutput<typeof ScheduleBody>;
  try {
    input = v.parse(ScheduleBody, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        insert into public.schedules (title, body, start_at, end_at, all_day, color, icon, event_type, created_by)
        values (${input.title ?? null}, ${input.body ?? null}, ${input.startAt}, ${input.endAt},
                ${input.allDay ?? false}, ${input.color ?? null}, ${input.icon ?? null},
                ${input.eventType ?? null}, app.uid())
        returning id, title, body,
                  start_at as "startAt", end_at as "endAt",
                  all_day  as "allDay", color, icon, event_type as "eventType"
      `,
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
}
