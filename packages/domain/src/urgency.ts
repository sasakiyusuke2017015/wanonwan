import * as v from "valibot";

// 緊急度マスタ（urgency_levels）。高 / 中 / 低 などの段階。
// code は並び順兼一意キー（例 1=低 / 2=中 / 3=高）。権限とは無関係な業務マスタ。
const urgencyCode = v.pipe(
  v.number(),
  v.integer("コードは整数です"),
  v.minValue(1, "コードは 1 以上です"),
  v.maxValue(9999, "コードは 9999 以下です"),
);

export const CreateUrgencySchema = v.object({
  code: urgencyCode,
  name: v.pipe(v.string(), v.minLength(1, "名前は必須です")),
});
export type CreateUrgency = v.InferOutput<typeof CreateUrgencySchema>;

export const UpdateUrgencySchema = v.partial(CreateUrgencySchema);
export type UpdateUrgency = v.InferOutput<typeof UpdateUrgencySchema>;
