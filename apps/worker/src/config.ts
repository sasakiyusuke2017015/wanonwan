// worker 設定。接続先（DATABASE_URL）は env 必須で、既定値へのフォールバックは持たない
// （誤った DB に黙って繋がるのを防ぐ）。GC_* はポーリング挙動のチューニング値。
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} が設定されていません（必須）`);
  return value;
}

export const config = {
  // pgmq の read/delete は特権が要るため worker は superuser で接続する（保守デーモン）。
  databaseUrl: requireEnv("DATABASE_URL"),
  queue: process.env.GC_QUEUE ?? "attachment_gc",
  visibilitySeconds: Number(process.env.GC_VISIBILITY_SECONDS ?? 30),
  batch: Number(process.env.GC_BATCH ?? 10),
  idleMs: Number(process.env.GC_IDLE_MS ?? 5000),
  errorMs: Number(process.env.GC_ERROR_MS ?? 10000),
};
