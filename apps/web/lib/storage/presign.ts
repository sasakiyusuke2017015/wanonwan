import {
  type S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
