import * as v from "valibot";

// 本部マスタ（divisions）。code は業務コード（テキスト）。
export const CreateDivisionSchema = v.object({
  code: v.pipe(v.string(), v.minLength(1, "コードは必須です")),
  name: v.pipe(v.string(), v.minLength(1, "名前は必須です")),
});
export type CreateDivision = v.InferOutput<typeof CreateDivisionSchema>;

export const UpdateDivisionSchema = v.partial(CreateDivisionSchema);
export type UpdateDivision = v.InferOutput<typeof UpdateDivisionSchema>;
