import * as v from "valibot";

// survey_publications（DDL 50_publications.sql）。掲載状況コードと表示名。
export const PUBLICATION_STATUSES = [
  { value: 100, label: "未掲載" },
  { value: 150, label: "予約" },
  { value: 160, label: "処理中" },
  { value: 200, label: "実施中" },
  { value: 900, label: "完了" },
  { value: 910, label: "保留" },
  { value: 990, label: "エラー" },
] as const;

export const publicationStatusLabel = (s: number): string =>
  PUBLICATION_STATUSES.find((x) => x.value === s)?.label ?? String(s);

// 回答受付は実施中(200)のときのみ（業務ルールは API/UI で担保）。
export const PUBLICATION_OPEN_STATUS = 200;

export const CreatePublicationSchema = v.object({
  title: v.optional(v.string()),
  body: v.optional(v.string()),
  status: v.optional(v.number()),
  // ISO もしくは datetime-local 文字列（空文字は null 扱い）
  startAt: v.optional(v.nullable(v.string())),
  endAt: v.optional(v.nullable(v.string())),
});
export type CreatePublication = v.InferOutput<typeof CreatePublicationSchema>;

export const UpdatePublicationSchema = CreatePublicationSchema;
