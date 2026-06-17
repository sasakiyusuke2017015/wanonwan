import * as v from "valibot";

// users（DDL 30_users.sql）に対応するドメイン型 + バリデータ。
export const UserSchema = v.object({
  id: v.number(),
  code: v.string(),
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  positionId: v.nullable(v.number()),
  divisionId: v.nullable(v.number()),
  departmentId: v.nullable(v.number()),
  sectionId: v.nullable(v.number()),
});
export type User = v.InferOutput<typeof UserSchema>;

export const CreateUserSchema = v.object({
  code: v.pipe(v.string(), v.minLength(1, "ユーザーコードは必須です")),
  name: v.pipe(v.string(), v.minLength(1, "名前は必須です")),
  email: v.pipe(
    v.string(),
    v.minLength(1, "メールアドレスは必須です"),
    v.email("メールアドレスの形式が不正です"),
  ),
  positionId: v.optional(v.number()),
  divisionId: v.optional(v.number()),
  departmentId: v.optional(v.number()),
  sectionId: v.optional(v.number()),
});
export type CreateUser = v.InferOutput<typeof CreateUserSchema>;

export const UpdateUserSchema = v.partial(CreateUserSchema);
export type UpdateUser = v.InferOutput<typeof UpdateUserSchema>;
