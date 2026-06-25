import * as v from "valibot";

// 部マスタ（departments）。divisionId で本部に属する。
export const CreateDepartmentSchema = v.object({
  code: v.pipe(v.string(), v.minLength(1, "コードは必須です")),
  name: v.pipe(v.string(), v.minLength(1, "名前は必須です")),
  divisionId: v.pipe(v.number(), v.integer(), v.minValue(1, "本部を選択してください")),
});
export type CreateDepartment = v.InferOutput<typeof CreateDepartmentSchema>;

export const UpdateDepartmentSchema = v.partial(CreateDepartmentSchema);
export type UpdateDepartment = v.InferOutput<typeof UpdateDepartmentSchema>;
