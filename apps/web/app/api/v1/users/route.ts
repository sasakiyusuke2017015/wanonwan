import { NextResponse } from "next/server";
import { CreateUserSchema } from "@waoon/domain";
import { GoTrueError } from "@waoon/auth";
import { withActiveUser } from "@/lib/auth/route";
import { gotrue } from "@/lib/auth/gotrue";
import { generateInitialPassword } from "@/lib/auth/provisioning";
import { withServiceRole } from "@/lib/auth/service-role";
import { mustChangeAppMetadata } from "@/lib/auth/metadata";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

// ユーザー一覧（認証済みなら可。RLS users_select）。
export const GET = withActiveUser(async (_req, claims) => {
  const rows = await withUser(
    claims.sub,
    (tx) => tx`
    select id, code, name, email, role,
           position_id   as "positionId",
           division_id   as "divisionId",
           department_id as "departmentId",
           section_id    as "sectionId"
    from public.users
    order by id
  `,
  );
  return NextResponse.json({ data: rows });
});

// ユーザー新規作成 + GoTrue provisioning。
// 業務ユーザー(public.users)と GoTrue identity を同時に発行し、gotrue_id で紐付ける
// （これが無いと作成ユーザーはログインできない）。初期パスワードはサーバ生成し、
// レスポンスで管理者へ一度だけ返す。
//
// 認可: GoTrue identity を作る前に app.is_admin() で弾く（非 admin が認証ユーザーを
// 量産できないように）。最終ガードは insert 時の RLS users_write(WITH CHECK admin)。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateUserSchema);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  // 1) admin ゲート + 重複チェック（GoTrue identity を作る前に弾く）。
  let precheck: { admin: boolean; dup: boolean };
  try {
    precheck = await withUser(claims.sub, async (tx) => {
      const [adminRow] = await tx`select app.is_admin() as ok`;
      if (!adminRow?.ok) return { admin: false, dup: false };
      const dup = await tx`
        select 1 from public.users
        where email = ${input.email} or code = ${input.code}
        limit 1
      `;
      return { admin: true, dup: dup.length > 0 };
    });
  } catch (e) {
    return mapDbError(e);
  }
  if (!precheck.admin) return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  if (precheck.dup) {
    return NextResponse.json({ error: "コードまたはメールが重複しています" }, { status: 409 });
  }

  // 2) GoTrue identity を発行（admin API は service_role JWT を要求）。
  const initialPassword = generateInitialPassword();
  let gotrueId: string;
  try {
    const gotrueUser = await withServiceRole((token) =>
      gotrue.admin.createUser(
        {
          email: input.email,
          password: initialPassword,
          emailConfirm: true,
          userMetadata: { name: input.name },
          // 初期 PW はサーバ生成のため、初回ログイン後に変更を強制する。
          appMetadata: mustChangeAppMetadata(true),
        },
        token,
      ),
    );
    gotrueId = gotrueUser.id;
  } catch (e) {
    if (e instanceof GoTrueError && (e.status === 422 || e.status === 409)) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "認証ユーザーの作成に失敗しました" }, { status: 502 });
  }

  // 3) 業務ユーザーを gotrue_id 付きで insert。失敗したら GoTrue 側を掃除（orphan 防止）。
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
      insert into public.users (gotrue_id, code, name, email, role, position_id, division_id, department_id, section_id)
      values (${gotrueId}, ${input.code}, ${input.name}, ${input.email}, ${input.role ?? "member"},
              ${input.positionId ?? null}, ${input.divisionId ?? null},
              ${input.departmentId ?? null}, ${input.sectionId ?? null})
      returning id, code, name, email, role
    `,
    );
    return NextResponse.json({ data: rows[0], initialPassword }, { status: 201 });
  } catch (e) {
    try {
      await withServiceRole((token) => gotrue.admin.deleteUser(gotrueId, token));
    } catch (cleanupError) {
      // 掃除失敗は致命ではない（orphan GoTrue ユーザーが残るが業務ユーザーは未作成）。
      // 運用で拾えるよう gotrue_id を残す（パスワード等の機微情報は出さない）。
      console.error(`GoTrue orphan cleanup failed: gotrue_id=${gotrueId}`, cleanupError);
    }
    return mapDbError(e);
  }
});
