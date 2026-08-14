import { NextResponse } from "next/server";
import { UpdateDivisionSchema } from "@wanonwan/domain";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError, mapDeleteError } from "@/lib/db/errors";
import { parseBody } from "@/lib/api/request";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  const rows = await withUser(
    claims.sub,
    (tx) => tx`select id, code, name from public.divisions where id = ${Number(id)}`,
  );
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: rows[0] });
});

// 更新（admin のみ。RLS が最終ガード）。
export const PUT = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;
  const parsed = await parseBody(req, UpdateDivisionSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  const set: Record<string, unknown> = {};
  if (input.code !== undefined) set.code = input.code;
  if (input.name !== undefined) set.name = input.name;
  if (Object.keys(set).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        update public.divisions set ${tx(set)}
        where id = ${Number(id)}
        returning id, code, name
      `,
    );
    if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    return mapDbError(e);
  }
});

// 削除（admin のみ。部から参照されている等は 409）。
export const DELETE = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`delete from public.divisions where id = ${Number(id)} returning id`,
    );
    if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ data: { id: rows[0].id } });
  } catch (e) {
    return mapDeleteError(e);
  }
});
