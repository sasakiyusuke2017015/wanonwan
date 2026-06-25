import * as v from "valibot";

// 課マスタ（sections）。departmentId で部に属する。
export const CreateSectionSchema = v.object({
  code: v.pipe(v.string(), v.minLength(1, "コードは必須です")),
  name: v.pipe(v.string(), v.minLength(1, "名前は必須です")),
  departmentId: v.pipe(v.number(), v.integer(), v.minValue(1, "部を選択してください")),
});
export type CreateSection = v.InferOutput<typeof CreateSectionSchema>;

export const UpdateSectionSchema = v.partial(CreateSectionSchema);
export type UpdateSection = v.InferOutput<typeof UpdateSectionSchema>;
