import { describe, it, expect } from "vitest";
import { createInternalStorageClient, createStorageClient } from "./client.ts";
import { parseStorageEnv } from "./env.ts";

const base = {
  STORAGE_ENDPOINT: "https://storage.example.com",
  STORAGE_ACCESS_KEY: "key",
  STORAGE_SECRET_KEY: "secret",
  STORAGE_BUCKET: "attachments",
};

async function endpointOf(client: { config: { endpoint?: () => Promise<{ hostname: string }> } }) {
  const endpoint = client.config.endpoint;
  if (!endpoint) throw new Error("endpoint is not configured");
  return (await endpoint()).hostname;
}

describe("createStorageClient / createInternalStorageClient", () => {
  it("署名用は常に公開 endpoint を使う", async () => {
    const env = parseStorageEnv({ ...base, STORAGE_INTERNAL_ENDPOINT: "http://minio:9000" });
    expect(await endpointOf(createStorageClient(env))).toBe("storage.example.com");
  });

  it("internal 用は STORAGE_INTERNAL_ENDPOINT を優先する", async () => {
    const env = parseStorageEnv({ ...base, STORAGE_INTERNAL_ENDPOINT: "http://minio:9000" });
    expect(await endpointOf(createInternalStorageClient(env))).toBe("minio");
  });

  it("internal 未指定なら公開 endpoint にフォールバックする", async () => {
    const env = parseStorageEnv(base);
    expect(await endpointOf(createInternalStorageClient(env))).toBe("storage.example.com");
  });
});
