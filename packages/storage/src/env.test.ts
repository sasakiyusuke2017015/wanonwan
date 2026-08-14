import { describe, it, expect } from "vitest";
import { parseStorageEnv } from "./env.ts";

const base = {
  STORAGE_ENDPOINT: "http://localhost:9000",
  STORAGE_ACCESS_KEY: "minioadmin",
  STORAGE_SECRET_KEY: "minioadmin",
};

describe("parseStorageEnv", () => {
  it("必須が揃えば既定値を埋めて返す", () => {
    const env = parseStorageEnv(base);
    expect(env.STORAGE_REGION).toBe("us-east-1");
    expect(env.STORAGE_BUCKET).toBe("wanonwan");
    expect(env.STORAGE_INTERNAL_ENDPOINT).toBeUndefined();
  });

  it("認証情報が無ければ throw する（既定値で動かさない）", () => {
    expect(() => parseStorageEnv({ STORAGE_ENDPOINT: base.STORAGE_ENDPOINT })).toThrow(
      /STORAGE_ACCESS_KEY.*STORAGE_SECRET_KEY/,
    );
  });

  it("空文字も欠落として扱う", () => {
    expect(() => parseStorageEnv({ ...base, STORAGE_SECRET_KEY: "" })).toThrow(
      /STORAGE_SECRET_KEY/,
    );
  });

  it("endpoint が URL でなければ throw する", () => {
    expect(() => parseStorageEnv({ ...base, STORAGE_ENDPOINT: "localhost:9000" })).toThrow(
      /STORAGE_ENDPOINT/,
    );
  });

  it("internal endpoint は指定すればそのまま返る", () => {
    const env = parseStorageEnv({ ...base, STORAGE_INTERNAL_ENDPOINT: "http://minio:9000" });
    expect(env.STORAGE_INTERNAL_ENDPOINT).toBe("http://minio:9000");
  });

  it("既定値は明示指定で上書きできる", () => {
    const env = parseStorageEnv({ ...base, STORAGE_REGION: "ap-northeast-1", STORAGE_BUCKET: "x" });
    expect(env.STORAGE_REGION).toBe("ap-northeast-1");
    expect(env.STORAGE_BUCKET).toBe("x");
  });
});
