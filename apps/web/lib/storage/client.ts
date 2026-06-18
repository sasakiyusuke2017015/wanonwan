import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

// MinIO（S3 互換）クライアント。dev 既定は compose の :9000。
// presigned URL は browser-reachable な STORAGE_ENDPOINT で署名するため、
// stg/prod では nginx 経由の公開ホストを渡す（evergreen.md の制約コメント参照）。
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT ?? "http://localhost:9000";
const STORAGE_REGION = process.env.STORAGE_REGION ?? "us-east-1";
const ACCESS_KEY = process.env.STORAGE_ACCESS_KEY ?? process.env.MINIO_ROOT_USER ?? "minioadmin";
const SECRET_KEY =
  process.env.STORAGE_SECRET_KEY ?? process.env.MINIO_ROOT_PASSWORD ?? "minioadmin";

export const STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? "waoon";

export const storage = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  region: STORAGE_REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  // MinIO は path-style（endpoint/bucket/key）。virtual-host style を使わない。
  forcePathStyle: true,
});
