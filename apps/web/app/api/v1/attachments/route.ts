import { NextResponse } from "next/server";
import * as v from "valibot";
import { randomUUID } from "node:crypto";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { ensureBucket, isAllowedContentType, objectKeyFor, presignPut } from "@wanonwan/storage";
import { storageBucket, storageContext } from "@/lib/storage";

const ENTITY_TYPES = ["interview", "answer", "survey", "user_avatar"] as const;

const CreateBody = v.object({
  entityType: v.picklist(ENTITY_TYPES),
  entityId: v.number(),
  filename: v.pipe(v.string(), v.minLength(1)),
  contentType: v.pipe(v.string(), v.minLength(1)),
});

// 添付メタを作成し presigned PUT URL を返す（ブラウザが MinIO へ直接アップロード）。
// 書込可否は RLS(WITH CHECK = 面談者 or admin) が判定。uploaded_by は app.uid() に固定。
export const POST = withActiveUser(async (req, claims) => {
  const parsed = await parseBody(req, CreateBody);
  if (parsed instanceof NextResponse) return parsed;
  const input = parsed;

  // server-side の MIME allowlist（presign 前に弾く）。サイズ上限は complete の実体検証で担保。
  if (!isAllowedContentType(input.contentType)) {
    return NextResponse.json({ error: "許可されていないファイル種別です" }, { status: 415 });
  }

  const key = objectKeyFor(input.entityType, input.entityId, randomUUID());
  const bucket = storageBucket();

  // アバターは pending を作るだけ（旧 avatar は upload 完了= complete 成功時に置き換える。
  // 作成時に消すと、新 upload を放棄したときに旧 avatar を失うため）。
  let created: Array<{ id: number }>;
  try {
    created = await withUser(claims.sub, (tx) => {
      return tx`
        insert into public.attachments
          (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
        values
          (${input.entityType}, ${input.entityId}, ${bucket}, ${key},
           ${input.filename}, ${input.contentType}, app.uid())
        returning id
      `;
    });
  } catch (e) {
    return mapDbError(e);
  }
  const row = created[0];
  if (!row) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  // bucket 作成は internal client（compose 内なら minio へ直結）、署名は公開 endpoint の client。
  const { signing, internal } = storageContext();
  await ensureBucket(internal, bucket);
  const uploadUrl = await presignPut(signing, bucket, key, input.contentType);
  return NextResponse.json({ data: { id: row.id, objectKey: key, uploadUrl } }, { status: 201 });
});

// 添付一覧（entityType/entityId 指定）。RLS が可視性を絞る。
export const GET = withActiveUser(async (req, claims) => {
  const url = new URL(req.url);
  const entityType = url.searchParams.get("entityType");
  const entityId = Number(url.searchParams.get("entityId"));
  if (!entityType || !(ENTITY_TYPES as readonly string[]).includes(entityType) || !Number.isInteger(entityId)) {
    return NextResponse.json({ error: "entityType/entityId が不正です" }, { status: 400 });
  }
  const rows = await withUser(
    claims.sub,
    (tx) => tx`
      select id, filename, content_type as "contentType", size_bytes as "sizeBytes",
             status, created_at as "createdAt"
      from public.attachments
      where entity_type = ${entityType} and entity_id = ${entityId} and status = 200
      order by id
    `,
  );
  return NextResponse.json({ data: rows });
});
