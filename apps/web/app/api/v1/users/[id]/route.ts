import { NextResponse } from "next/server";
import * as v from "valibot";
import { UpdateUserSchema } from "@waoon/domain";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;

  const rows = await withUser(claims.sub, (tx) => tx`
    select id, code, name, email,
           position_id   as "positionId",
           division_id   as "divisionId",
           department_id as "departmentId",
           section_id    as "sectionId"
    from public.users where id = ${Number(id)}
  `);
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: rows[0] });
}

// 更新（RLS users_write = admin のみ。非 admin は対象 0 行 → 404 相当）。
export async function PUT(req: Request, { params }: Ctx) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;

  let input: v.InferOutput<typeof UpdateUserSchema>;
  try {
    input = v.parse(UpdateUserSchema, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  const set: Record<string, unknown> = {};
  if (input.code !== undefined) set.code = input.code;
  if (input.name !== undefined) set.name = input.name;
  if (input.email !== undefined) set.email = input.email;
  if (input.positionId !== undefined) set.position_id = input.positionId;
  if (input.divisionId !== undefined) set.division_id = input.divisionId;
  if (input.departmentId !== undefined) set.department_id = input.departmentId;
  if (input.sectionId !== undefined) set.section_id = input.sectionId;
  if (Object.keys(set).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      update public.users set ${tx(set)}, updated_at = now()
      where id = ${Number(id)}
      returning id, code, name, email
    `);
    if (rows.length === 0) return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    return mapDbError(e);
  }
}
