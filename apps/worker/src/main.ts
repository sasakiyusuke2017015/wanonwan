// 添付 GC worker。pgmq の attachment_gc キューをポーリングし、MinIO のオブジェクト本体を削除する。
// 投入は DB トリガ（attachments の DELETE 時に bucket/object_key を enqueue）。
// 失敗時は pgmq.delete しない → visibility timeout 後に再配信されるため at-least-once で安全。
import postgres from "postgres";
import { createInternalStorageClient, deleteObject, parseStorageEnv } from "@wanonwan/storage";
import { parseGcMessage } from "./gc.ts";
import { config } from "./config.ts";

const sql = postgres(config.databaseUrl);
// worker は presign せず server-side の削除だけを行うため internal endpoint 側の client を使う。
const storage = createInternalStorageClient(parseStorageEnv());

// キューを 1 バッチ処理し、処理した件数を返す。
async function tick(): Promise<number> {
  const rows = await sql<{ msg_id: string; message: unknown }[]>`
    SELECT msg_id, message
    FROM pgmq.read(${config.queue}, ${config.visibilitySeconds}, ${config.batch})
  `;
  for (const row of rows) {
    let target: { bucket: string; objectKey: string };
    try {
      target = parseGcMessage(row.message);
    } catch (e) {
      // 壊れたメッセージは無限再配信を避けてアーカイブする。
      console.error("invalid gc message; archiving", { msgId: row.msg_id }, e);
      await sql`SELECT pgmq.archive(${config.queue}, ${row.msg_id}::bigint)`;
      continue;
    }
    try {
      await deleteObject(storage, target.bucket, target.objectKey);
      await sql`SELECT pgmq.delete(${config.queue}, ${row.msg_id}::bigint)`;
    } catch (e) {
      // 削除失敗は ack しない → visibility timeout 後に再試行される。
      console.error("attachment gc failed; will retry after vt", { msgId: row.msg_id }, e);
    }
  }
  return rows.length;
}

let running = true;
const stop = () => {
  running = false;
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);

console.log(`attachment-gc worker started (queue=${config.queue})`);
while (running) {
  try {
    const processed = await tick();
    if (processed === 0) await new Promise((r) => setTimeout(r, config.idleMs));
  } catch (e) {
    console.error("worker tick error", e);
    await new Promise((r) => setTimeout(r, config.errorMs));
  }
}

await sql.end();
console.log("attachment-gc worker stopped");
