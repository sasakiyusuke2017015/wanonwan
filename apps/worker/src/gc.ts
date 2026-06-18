// pgmq の添付削除メッセージ（attachment_gc）のパース・検証。MinIO の bucket / object_key を取り出す純関数。
// DB トリガが jsonb_build_object('bucket', ..., 'object_key', ...) で積む形に対応する。
export type AttachmentGcMessage = { bucket: string; objectKey: string };

export function parseGcMessage(message: unknown): AttachmentGcMessage {
  if (typeof message === "object" && message !== null) {
    const rec = message as Record<string, unknown>;
    const bucket = rec.bucket;
    const objectKey = rec.object_key;
    if (typeof bucket === "string" && bucket.length > 0 && typeof objectKey === "string" && objectKey.length > 0) {
      return { bucket, objectKey };
    }
  }
  throw new Error("invalid attachment_gc message shape");
}
