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

// ロールの表示優先順（上位から）。アクティブロールの既定は最上位保有ロール。
export const ROLE_PRIORITY: readonly UserRole[] = ["admin", "interviewer", "member"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  interviewer: "面談担当",
  member: "メンバー",
};

// 保有ロール一覧（member は暗黙保有で常に含む）を優先順で返す。
export function heldRoles(elevated: readonly ElevatedRole[]): UserRole[] {
  return ROLE_PRIORITY.filter(
    (r) => r === "member" || (elevated as readonly UserRole[]).includes(r),
  );
}

// アクティブロールの解決。候補（cookie 値）は信頼せず、保有集合に含まれなければ破棄して
// 最上位保有ロールへフォールバックする。アクティブロールは表示状態であり認可には使わない。
export function resolveActiveRole(
  roles: readonly UserRole[],
  candidate: string | null | undefined,
): UserRole {
  return roles.includes(candidate as UserRole) ? (candidate as UserRole) : (roles[0] ?? "member");
}

export const SetActiveRoleSchema = v.object({ role: UserRoleSchema });
export type SetActiveRole = v.InferOutput<typeof SetActiveRoleSchema>;

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
