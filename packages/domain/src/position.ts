import * as v from "valibot";

// 役職マスタ（positions）。code は組織上の肩書きを表す数値（HR マスタ）。
// 権限（admin か否か）は user_roles が持つ別軸のため、ここに admin 帯の特別扱いは無い。
const positionCode = v.pipe(
  v.number(),
  v.integer("コードは整数です"),
  v.minValue(1, "コードは 1 以上です"),
  v.maxValue(9999, "コードは 9999 以下です"),
);

export const CreatePositionSchema = v.object({
  code: positionCode,
  name: v.pipe(v.string(), v.minLength(1, "名前は必須です")),
});
export type CreatePosition = v.InferOutput<typeof CreatePositionSchema>;

export const UpdatePositionSchema = v.partial(CreatePositionSchema);
export type UpdatePosition = v.InferOutput<typeof UpdatePositionSchema>;
