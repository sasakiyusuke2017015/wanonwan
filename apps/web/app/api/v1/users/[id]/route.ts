import { NextResponse } from "next/server";
import { UpdateUserSchema } from "@waoon/domain";
import { GoTrueError } from "@waoon/auth";
import { withActiveUser } from "@/lib/auth/route";
import { gotrue } from "@/lib/auth/gotrue";
import { withServiceRole } from "@/lib/auth/service-role";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
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
});

// 更新（admin のみ。GoTrue を触る前に app.is_admin() で 403。RLS users_write が最終ガード）。
export const PUT = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;

  const parsed = await parseBody(req, UpdateUserSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

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

  // admin ゲート + 対象行（gotrue_id と現 email）を先に引く。GoTrue I/O を挟むため
  // select 用 tx は閉じる。非 admin に service_role 経由の外部副作用を起こさせないため、
  // GoTrue を触る前に app.is_admin() で弾く（POST /users・reset-password と同様）。
  let pre: { admin: boolean; row?: { gotrueId: string | null; email: string } };
  try {
    pre = await withUser(claims.sub, async (tx) => {
      const [adminRow] = await tx`select app.is_admin() as ok`;
      if (!adminRow?.ok) return { admin: false };
      const rows = await tx`select gotrue_id as "gotrueId", email from public.users where id = ${Number(id)}`;
      return { admin: true, row: rows[0] as { gotrueId: string | null; email: string } | undefined };
    });
  } catch (e) {
    return mapDbError(e);
  }
  if (!pre.admin) return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  if (!pre.row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const target = pre.row;

  // email を変える場合は GoTrue を真実源として先に更新する（GoTrue→DB 順）。
  const emailChanged = input.email !== undefined && input.email !== target.email;
  const oldEmail = target.email;
  if (emailChanged) {
    if (!target.gotrueId) {
      // identity 未紐付け（旧データ）はログイン不能なので email 同期もできない。
      return NextResponse.json({ error: "認証ユーザーが紐付いていません" }, { status: 409 });
    }
    try {
      await withServiceRole((token) =>
        gotrue.admin.updateUser(target.gotrueId!, { email: input.email, emailConfirm: true }, token),
      );
    } catch (e) {
      if (e instanceof GoTrueError && (e.status === 422 || e.status === 409)) {
        return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 409 });
      }
      return NextResponse.json({ error: "認証ユーザーの更新に失敗しました" }, { status: 502 });
    }
  }

  try {
    const rows = await withUser(claims.sub, (tx) => tx`
      update public.users set ${tx(set)}, updated_at = now()
      where id = ${Number(id)}
      returning id, code, name, email
    `);
    if (rows.length === 0) {
      // DB update が 0 行（RLS で弾かれた等）。GoTrue を先に変えていたら旧 email へ戻す。
      if (emailChanged) await rollbackGotrueEmail(target.gotrueId!, oldEmail);
      return NextResponse.json({ error: "not found or forbidden" }, { status: 404 });
    }
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    // DB 失敗（unique violation 等）。GoTrue を先に変えていたら旧 email へ best-effort ロールバック。
    if (emailChanged) await rollbackGotrueEmail(target.gotrueId!, oldEmail);
    return mapDbError(e);
  }
});

// GoTrue email を旧値へ戻す。失敗は致命ではない（DB=旧・ログイン=新 のズレが残るため
// gotrue_id を残して運用で拾えるようにする。PW 等の機微情報は出さない）。
async function rollbackGotrueEmail(gotrueId: string, oldEmail: string): Promise<void> {
  try {
    await withServiceRole((token) =>
      gotrue.admin.updateUser(gotrueId, { email: oldEmail, emailConfirm: true }, token),
    );
  } catch (rollbackError) {
    console.error(`GoTrue email rollback failed: gotrue_id=${gotrueId}`, rollbackError);
  }
}
