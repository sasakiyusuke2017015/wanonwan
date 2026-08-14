import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { gotrue } from "@/lib/auth/gotrue";
import { generateInitialPassword } from "@/lib/auth/provisioning";
import { withServiceRole } from "@/lib/auth/service-role";
import { mustChangeAppMetadata } from "@/lib/auth/metadata";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";

type Ctx = { params: Promise<{ id: string }> };

// admin がユーザーのパスワードをリセットする。サーバ生成 PW を一度だけ返し、
// 初回ログイン後の force-change フラグ（app_metadata）を立てる。
// 認可: GoTrue を触る前に app.is_admin() で弾く。
export const POST = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;

  // admin ゲート + 対象の gotrue_id 取得（GoTrue を触る前に）。
  let target: { admin: boolean; found: boolean; gotrueId: string | null };
  try {
    target = await withUser(claims.sub, async (tx) => {
      const [adminRow] = await tx`select app.is_admin() as ok`;
      if (!adminRow?.ok) return { admin: false, found: false, gotrueId: null };
      const rows = await tx`select gotrue_id as "gotrueId" from public.users where id = ${Number(id)}`;
      const row = rows[0] as { gotrueId: string | null } | undefined;
      return { admin: true, found: row !== undefined, gotrueId: row?.gotrueId ?? null };
    });
  } catch (e) {
    return mapDbError(e);
  }
  if (!target.admin) return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  if (!target.found) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!target.gotrueId) {
    return NextResponse.json({ error: "認証ユーザーが紐付いていません" }, { status: 409 });
  }

  const initialPassword = generateInitialPassword();
  try {
    await withServiceRole((token) =>
      gotrue().admin.updateUser(
        target.gotrueId!,
        { password: initialPassword, appMetadata: mustChangeAppMetadata(true) },
        token,
      ),
    );
  } catch (e) {
    console.error(`GoTrue password reset failed: gotrue_id=${target.gotrueId}`, e);
    return NextResponse.json({ error: "パスワードのリセットに失敗しました" }, { status: 502 });
  }

  return NextResponse.json({ initialPassword });
});
