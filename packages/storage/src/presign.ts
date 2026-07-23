import {
  type S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// バケットの存在を冪等に保証する（無ければ作る）。bucket ごとにプロセス内で 1 回だけ実行されるよう
// promise をキャッシュ（失敗時はリセットして次回再試行）。compose に init コンテナを置かず
// アプリ起動経路で吸収するため（`up --wait` が one-shot コンテナで失敗するのを避ける）。
const ensured = new Map<string, Promise<void>>();
export function ensureBucket(client: S3Client, bucket: string): Promise<void> {
  const cached = ensured.get(bucket);
  if (cached) return cached;
  const pending = (async () => {
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: bucket }));
    }
  })().catch((e) => {
    ensured.delete(bucket);
    throw e;
  });
  ensured.set(bucket, pending);
  return pending;
}

// presigned URL は API が認可判定の上で発行し、ブラウザが MinIO へ直接 upload/download する
// （ファイル本体は Next を経由しない）。署名はローカル生成でネットワーク不要。

export function presignPut(
  client: S3Client,
  bucket: string,
  key: string,
  contentType: string,
  expiresInSec = 300,
): Promise<string> {
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: expiresInSec },
  );
}

export function presignGet(
  client: S3Client,
  bucket: string,
  key: string,
  expiresInSec = 300,
): Promise<string> {
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: expiresInSec,
  });
}

export async function deleteObject(client: S3Client, bucket: string, key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// 実オブジェクトのメタ（サイズ・MIME）を取得する。存在しなければ null（complete の実体検証用）。
export async function headObject(
  client: S3Client,
  bucket: string,
  key: string,
): Promise<{ contentLength: number; contentType: string } | null> {
  try {
    const r = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { contentLength: r.ContentLength ?? 0, contentType: r.ContentType ?? "" };
  } catch (e) {
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) return null;
    throw e;
  }
}
