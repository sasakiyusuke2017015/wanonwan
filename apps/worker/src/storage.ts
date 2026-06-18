import { S3Client } from "@aws-sdk/client-s3";

// worker は server-side の DeleteObject のみ（presign しない）。dev/stg/prod とも
// 内部 MinIO（http://minio:9000 等）へ直接つなぐ。公開 storage サブドメインは使わない。
const endpoint = process.env.STORAGE_ENDPOINT ?? "http://localhost:9000";
const region = process.env.STORAGE_REGION ?? "us-east-1";
const accessKeyId = process.env.STORAGE_ACCESS_KEY ?? process.env.MINIO_ROOT_USER ?? "minioadmin";
const secretAccessKey =
  process.env.STORAGE_SECRET_KEY ?? process.env.MINIO_ROOT_PASSWORD ?? "minioadmin";

export const storage = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  // MinIO は path-style（endpoint/bucket/key）。
  forcePathStyle: true,
});
