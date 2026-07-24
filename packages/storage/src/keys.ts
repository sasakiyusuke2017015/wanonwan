// 添付の対象種別。attachments.entity_type と一致させる。
export type AttachmentEntity = "answer" | "interview" | "user_avatar" | "survey";

const PREFIX: Record<AttachmentEntity, string> = {
  answer: "answers",
  interview: "interviews",
  user_avatar: "avatars",
  survey: "surveys",
};

// オブジェクトキーを組む。`<prefix>/<entityId>/<uuid>`。uuid は呼び出し側で採番（推測不能）。
export function objectKeyFor(
  entity: AttachmentEntity,
  entityId: number | string,
  uuid: string,
): string {
  return `${PREFIX[entity]}/${entityId}/${uuid}`;
}
