import { NextResponse } from "next/server";
import * as v from "valibot";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { storage, STORAGE_BUCKET } from "@/lib/storage/client";
import { presignGet, deleteObject } from "@/lib/storage/presign";

type Ctx = { params: Promise<{ id: string }> };

// presigned GET URL を返す（ダウンロード）。RLS で見えない添付は 0 行 → 404。
export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  const [row] = await withUser(
    claims.sub,
    (tx) => tx`select object_key as "objectKey" from public.attachments where id = ${Number(id)}`,
  );
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const downloadUrl = await presignGet(storage, STORAGE_BUCKET, (row as { objectKey: string }).objectKey);
  return NextResponse.json({ data: { downloadUrl } });
});

const PatchBody = v.object({ sizeBytes: v.pipe(v.number(), v.minValue(0)) });

// アップロード完了を確定する（status=200 + 実サイズ）。書込可否は RLS。
export const PATCH = withActiveUser(async (req, claims, { params }: Ctx) => {
  const { id } = await params;
  const parsed = await parseBody(req, PatchBody);
  if (parsed instanceof NextResponse) return parsed;

  let updated: Array<{ id: number }>;
  try {
    updated = await withUser(
      claims.sub,
      (tx) => tx`
        update public.attachments
        set status = 200, size_bytes = ${parsed.sizeBytes}, updated_at = now()
        where id = ${Number(id)}
        returning id
      `,
    );
  } catch (e) {
    return mapDbError(e);
  }
  if (!updated[0]) return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  return NextResponse.json({ data: { ok: true } });
});

// 添付を削除する。RLS write(面談者/admin) で 0 行なら 403。MinIO 本体も削除（best-effort）。
export const DELETE = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  const [seen] = await withUser(
    claims.sub,
    (tx) => tx`select object_key as "objectKey" from public.attachments where id = ${Number(id)}`,
  );
  if (!seen) return NextResponse.json({ error: "not found" }, { status: 404 });

  let deleted: Array<{ id: number }>;
  try {
    deleted = await withUser(
      claims.sub,
      (tx) => tx`delete from public.attachments where id = ${Number(id)} returning id`,
    );
  } catch (e) {
    return mapDbError(e);
  }
  if (!deleted[0]) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  try {
    await deleteObject(storage, STORAGE_BUCKET, (seen as { objectKey: string }).objectKey);
  } catch (e) {
    console.error("storage object delete failed", e);
  }
  return NextResponse.json({ data: { ok: true } });
});
