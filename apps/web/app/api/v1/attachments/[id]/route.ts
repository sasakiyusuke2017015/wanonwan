import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import {
  deleteObject,
  headObject,
  isAllowedContentType,
  isWithinMaxSize,
  presignGet,
} from "@waoon/storage";
import { storageBucket, storageContext } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

// presigned GET URL を返す（ダウンロード）。確定済み(status=200)のみ。pending/不可視は 404。
export const GET = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  const [row] = await withUser(
    claims.sub,
    (tx) =>
      tx`select object_key as "objectKey" from public.attachments where id = ${Number(id)} and status = 200`,
  );
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const downloadUrl = await presignGet(
    storageContext().signing,
    storageBucket(),
    (row as { objectKey: string }).objectKey,
  );
  return NextResponse.json({ data: { downloadUrl } });
});

// アップロード完了を確定する。クライアント申告ではなく MinIO の実オブジェクトを検証してから
// status=200 にする（不在=422 / サイズ超過=413 / MIME 不許可=415）。size_bytes は実測値。
// avatar は新 upload が確認できて初めて旧 avatar を置き換える（complete tx 内で旧を削除→自分を確定）。
export const PATCH = withActiveUser(async (_req, claims, { params }: Ctx) => {
  const { id } = await params;
  const attachmentId = Number(id);

  // 1) 対象を RLS スコープで取得（書込可否も RLS が判定）。
  let target: { objectKey: string; entityType: string; entityId: number } | undefined;
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        select object_key as "objectKey", entity_type as "entityType", entity_id as "entityId"
        from public.attachments where id = ${attachmentId}
      `,
    );
    target = rows[0] as typeof target;
  } catch (e) {
    return mapDbError(e);
  }
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });

  // 2) 実オブジェクトを検証。
  let head: { contentLength: number; contentType: string } | null;
  try {
    head = await headObject(storageContext().internal, storageBucket(), target.objectKey);
  } catch (e) {
    console.error("headObject failed", e);
    return NextResponse.json({ error: "ストレージ確認に失敗しました" }, { status: 502 });
  }
  if (!head) return NextResponse.json({ error: "アップロードが確認できません" }, { status: 422 });
  if (!isWithinMaxSize(head.contentLength)) {
    return NextResponse.json({ error: "ファイルサイズが上限を超えています" }, { status: 413 });
  }
  if (!isAllowedContentType(head.contentType)) {
    return NextResponse.json({ error: "許可されていないファイル種別です" }, { status: 415 });
  }

  // 3) 確定。avatar は確定 tx 内で旧行を先に削除してから自分を 200 にする
  //    （unique index は status=200 のみ対象。旧 object は DELETE トリガ→worker で本体掃除）。
  const size = head.contentLength;
  let updated: Array<{ id: number }>;
  try {
    updated = await withUser(claims.sub, async (tx) => {
      if (target.entityType === "user_avatar") {
        await tx`
          delete from public.attachments
          where entity_type = 'user_avatar' and entity_id = ${target.entityId} and id <> ${attachmentId}
        `;
      }
      return tx`
        update public.attachments
        set status = 200, size_bytes = ${size}, updated_at = now()
        where id = ${attachmentId}
        returning id
      `;
    });
  } catch (e) {
    return mapDbError(e);
  }
  if (!updated[0]) return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  return NextResponse.json({ data: { ok: true, sizeBytes: size } });
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
    await deleteObject(
      storageContext().internal,
      storageBucket(),
      (seen as { objectKey: string }).objectKey,
    );
  } catch (e) {
    console.error("storage object delete failed", e);
  }
  return NextResponse.json({ data: { ok: true } });
});
