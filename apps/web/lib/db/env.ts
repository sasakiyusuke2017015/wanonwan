import "server-only";

// apps/web は app_user で DB に接続する（public スキーマのみ・RLS 対象）。
// dev は compose の app_user/app にフォールバック。stg/prod は env 必須。
export const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://app_user:app@localhost:5432/wanonwan";
