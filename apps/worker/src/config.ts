// worker 設定。dev は既定値でそのまま動く（compose の postgres / minio）。
// stg/prod は DATABASE_URL（superuser: pgmq の read/delete に必要）と STORAGE_* を env で渡す。
export const config = {
  // pgmq の read/delete は特権が要るため worker は superuser で接続する（保守デーモン）。
  databaseUrl: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/wanonwan",
  queue: process.env.GC_QUEUE ?? "attachment_gc",
  visibilitySeconds: Number(process.env.GC_VISIBILITY_SECONDS ?? 30),
  batch: Number(process.env.GC_BATCH ?? 10),
  idleMs: Number(process.env.GC_IDLE_MS ?? 5000),
  errorMs: Number(process.env.GC_ERROR_MS ?? 10000),
};
