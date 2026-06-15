import "server-only";
import { mintServiceRoleToken } from "./provisioning";

// 短命の service_role トークンを mint して fn に渡すだけ。fn 内で GoTrue admin API を呼ぶ。
// エラー変換（409/502）・best-effort・rollback は endpoint ごとに違うため呼び出し側に残す。
// インライン型なので 1 ハンドラ内で複数回呼べる（例: create + orphan cleanup）。
export async function withServiceRole<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const token = await mintServiceRoleToken();
  return fn(token);
}
