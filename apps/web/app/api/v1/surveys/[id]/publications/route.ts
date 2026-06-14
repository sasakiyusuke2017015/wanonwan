import { NextResponse } from "next/server";
import * as v from "valibot";
import { CreatePublicationSchema } from "@waoon/domain";
import { getCurrentClaims, forceChangeGuard } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

const nz = (s: string | null | undefined) => (s ? s : null);

export async function GET(_req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;

  const rows = await withUser(claims.sub, (tx) => tx`
    select id, title, body, status,
           start_at as "startAt", end_at as "endAt"
    from public.survey_publications
    where survey_id = ${Number(id)}
    order by id desc
  `);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const mustChange = forceChangeGuard(claims);
  if (mustChange) return mustChange;
  const { id } = await params;

  let input: v.InferOutput<typeof CreatePublicationSchema>;
  try {
    input = v.parse(CreatePublicationSchema, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      insert into public.survey_publications (survey_id, title, body, status, start_at, end_at)
      values (${Number(id)}, ${nz(input.title)}, ${nz(input.body)}, ${input.status ?? 100},
              ${nz(input.startAt)}, ${nz(input.endAt)})
      returning id, title, body, status, start_at as "startAt", end_at as "endAt"
    `);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
}
