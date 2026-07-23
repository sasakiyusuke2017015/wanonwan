import { S3Client } from "@aws-sdk/client-s3";

import type { StorageEnv } from "./env.ts";

// S3Client は construct 時に endpoint が固定される。ブラウザ向けに presigned URL を署名する用途と、
// server から S3 API を実通信する用途で endpoint が異なるため、client を作り分ける。
// MinIO は path-style（endpoint/bucket/key）なので virtual-host style は使わない。

function create(endpoint: string, env: StorageEnv): S3Client {
  return new S3Client({
    endpoint,
    region: env.STORAGE_REGION,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
  });
}

// presigned URL の署名用（browser-reachable な公開 endpoint で署名する）。
export function createStorageClient(env: StorageEnv): S3Client {
  return create(env.STORAGE_ENDPOINT, env);
}

// server から S3 API を実通信する用途（HeadObject / DeleteObject / CreateBucket）。
export function createInternalStorageClient(env: StorageEnv): S3Client {
  return create(env.STORAGE_INTERNAL_ENDPOINT ?? env.STORAGE_ENDPOINT, env);
}
