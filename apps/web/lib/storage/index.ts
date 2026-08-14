import "server-only";
import {
  createInternalStorageClient,
  createStorageClient,
  parseStorageEnv,
  type StorageEnv,
} from "@wanonwan/storage";
import type { S3Client } from "@aws-sdk/client-s3";

// @wanonwan/storage は framework 非依存（worker も使う）。Next.js の server-only 規律と
// env の読み出しはこのアダプタに閉じる。
//
// env の検証は初回アクセス時に行う（module 評価時に走らせると、STORAGE_* を渡さない
// `next build` が env 不足で失敗するため）。

type StorageContext = {
  env: StorageEnv;
  /** presigned URL の署名用（browser-reachable な endpoint で署名する）。 */
  signing: S3Client;
  /** server から S3 API を実通信する用途（Head / Delete / CreateBucket）。 */
  internal: S3Client;
};

let cached: StorageContext | null = null;

export function storageContext(): StorageContext {
  if (!cached) {
    const env = parseStorageEnv();
    cached = {
      env,
      signing: createStorageClient(env),
      internal: createInternalStorageClient(env),
    };
  }
  return cached;
}

export function storageBucket(): string {
  return storageContext().env.STORAGE_BUCKET;
}
