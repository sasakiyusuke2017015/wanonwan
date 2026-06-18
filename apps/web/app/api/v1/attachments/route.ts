import { NextResponse } from "next/server";
import * as v from "valibot";
import { randomUUID } from "node:crypto";
import { withActiveUser } from "@/lib/auth/route";
import { parseBody } from "@/lib/api/request";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { storage, STORAGE_BUCKET } from "@/lib/storage/client";
import { objectKeyFor } from "@/lib/storage/keys";
import { presignPut } from "@/lib/storage/presign";

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

  const key = objectKeyFor(input.entityType, input.entityId, randomUUID());

  let created: Array<{ id: number }>;
  try {
    created = await withUser(claims.sub, async (tx) => {
      // アバターは 1 ユーザー 1 枚。既存があれば置き換える（旧オブジェクトは pg_cron で掃除予定）。
      if (input.entityType === "user_avatar") {
        await tx`delete from public.attachments
                 where entity_type = 'user_avatar' and entity_id = ${input.entityId}`;
      }
      return tx`
        insert into public.attachments
          (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
        values
          (${input.entityType}, ${input.entityId}, ${STORAGE_BUCKET}, ${key},
           ${input.filename}, ${input.contentType}, app.uid())
        returning id
      `;
    });
  } catch (e) {
    return mapDbError(e);
  }
  const row = created[0];
  if (!row) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const uploadUrl = await presignPut(storage, STORAGE_BUCKET, key, input.contentType);
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
      where entity_type = ${entityType} and entity_id = ${entityId}
      order by id
    `,
  );
  return NextResponse.json({ data: rows });
});
