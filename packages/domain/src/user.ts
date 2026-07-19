import * as v from "valibot";

// 認可ロール（役職とは別軸）。member は全員が暗黙保有し、user_roles には上位ロール
// （admin / interviewer）のみ行として持つ。認可は保有集合(union)で判定し、
// UI のアクティブロール切替は表示状態であって認可には使わない。
export const UserRoleSchema = v.picklist(
  ["admin", "interviewer", "member"],
  "role は admin / interviewer / member のいずれかです",
);
export type UserRole = v.InferOutput<typeof UserRoleSchema>;

// user_roles に格納できる上位ロール（member は暗黙保有のため含まない）。
export const ElevatedRoleSchema = v.picklist(
  ["admin", "interviewer"],
  "roles は admin か interviewer です",
);
export type ElevatedRole = v.InferOutput<typeof ElevatedRoleSchema>;

// users（DDL 30_users.sql）に対応するドメイン型 + バリデータ。
export const UserSchema = v.object({
  id: v.number(),
  code: v.string(),
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  roles: v.array(ElevatedRoleSchema),
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
  roles: v.optional(v.array(ElevatedRoleSchema)),
  positionId: v.optional(v.number()),
  divisionId: v.optional(v.number()),
  departmentId: v.optional(v.number()),
  sectionId: v.optional(v.number()),
});
export type CreateUser = v.InferOutput<typeof CreateUserSchema>;

export const UpdateUserSchema = v.partial(CreateUserSchema);
export type UpdateUser = v.InferOutput<typeof UpdateUserSchema>;
