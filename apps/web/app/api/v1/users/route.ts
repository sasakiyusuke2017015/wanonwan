import { NextResponse } from "next/server";
import * as v from "valibot";
import { CreateUserSchema } from "@waoon/domain";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

// ユーザー一覧（認証済みなら可。RLS users_select）。
export async function GET() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const rows = await withUser(claims.sub, (tx) => tx`
    select id, code, name, email,
           position_id   as "positionId",
           division_id   as "divisionId",
           department_id as "departmentId",
           section_id    as "sectionId"
    from public.users
    order by id
  `);
  return NextResponse.json({ data: rows });
}

// ユーザー新規作成（RLS users_write = admin のみ。非 admin は 42501 → 403）。
export async function POST(req: Request) {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let input: v.InferOutput<typeof CreateUserSchema>;
  try {
    input = v.parse(CreateUserSchema, await req.json());
  } catch {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      insert into public.users (code, name, email, position_id, division_id, department_id, section_id)
      values (${input.code}, ${input.name}, ${input.email},
              ${input.positionId ?? null}, ${input.divisionId ?? null},
              ${input.departmentId ?? null}, ${input.sectionId ?? null})
      returning id, code, name, email
    `);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    return mapDbError(e);
  }
}
