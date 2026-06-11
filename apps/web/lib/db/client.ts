import "server-only";
import postgres from "postgres";
import { DATABASE_URL } from "./env";

// app_user 接続。業務テーブルは RLS 対象。
const sql = postgres(DATABASE_URL, { max: 10 });

export type Sql = typeof sql;

// RLS ユーザーコンテキスト注入（計画レビュー BLOCKER① の実コード化）:
// トランザクション内で set_config('app.user_id', <gotrue sub>, is_local=true) を実行し、
// RLS の app.current_user_id() がこのユーザーを参照できるようにする。
// gotrueSub が null/空なら未設定（RLS は fail-closed）。
export async function withUser<T>(
  gotrueSub: string | null,
  fn: (tx: Sql) => Promise<T>,
): Promise<T> {
  return sql.begin(async (tx) => {
    await tx`select set_config('app.user_id', ${gotrueSub ?? ""}, true)`;
    return fn(tx as unknown as Sql);
  }) as Promise<T>;
}

export { sql };
