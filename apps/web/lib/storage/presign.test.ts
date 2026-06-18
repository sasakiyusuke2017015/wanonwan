import { describe, it, expect } from "vitest";
import { S3Client } from "@aws-sdk/client-s3";
import { presignPut, presignGet } from "./presign";

// presigning はローカル署名のみ（ネットワーク不要）。ダミー資格情報で URL 生成を検証する。
const client = new S3Client({
  endpoint: "http://localhost:9000",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "testsecret" },
  forcePathStyle: true,
});

describe("presign", () => {
  it("presignPut は bucket/key を含む署名付き URL（TTL 反映）", async () => {
    const url = await presignPut(client, "waoon", "interviews/5/abc", "image/png", 300);
    expect(url).toContain("/waoon/interviews/5/abc");
    expect(url).toContain("X-Amz-Signature");
    expect(url).toContain("X-Amz-Expires=300");
  });

  it("presignGet も署名付き URL を返す", async () => {
    const url = await presignGet(client, "waoon", "interviews/5/abc", 120);
    expect(url).toContain("/waoon/interviews/5/abc");
    expect(url).toContain("X-Amz-Signature");
    expect(url).toContain("X-Amz-Expires=120");
  });
});
