import { describe, it, expect } from "vitest";
import { isAllowedContentType, isWithinMaxSize, MAX_ATTACHMENT_BYTES } from "./policy.ts";

describe("isAllowedContentType", () => {
  it("allowlist の型を許可する", () => {
    expect(isAllowedContentType("image/png")).toBe(true);
    expect(isAllowedContentType("application/pdf")).toBe(true);
  });

  it("大文字小文字・charset パラメータを無視して判定する", () => {
    expect(isAllowedContentType("IMAGE/PNG")).toBe(true);
    expect(isAllowedContentType("text/csv; charset=utf-8")).toBe(true);
    expect(isAllowedContentType("  application/pdf  ")).toBe(true);
  });

  it("allowlist 外は拒否する", () => {
    expect(isAllowedContentType("application/x-msdownload")).toBe(false);
    expect(isAllowedContentType("text/html")).toBe(false);
    expect(isAllowedContentType("")).toBe(false);
  });
});

describe("isWithinMaxSize", () => {
  it("0〜上限は許可", () => {
    expect(isWithinMaxSize(0)).toBe(true);
    expect(isWithinMaxSize(1024)).toBe(true);
    expect(isWithinMaxSize(MAX_ATTACHMENT_BYTES)).toBe(true);
  });

  it("上限超過・負数・非数は拒否", () => {
    expect(isWithinMaxSize(MAX_ATTACHMENT_BYTES + 1)).toBe(false);
    expect(isWithinMaxSize(-1)).toBe(false);
    expect(isWithinMaxSize(Number.NaN)).toBe(false);
    expect(isWithinMaxSize(Number.POSITIVE_INFINITY)).toBe(false);
  });
});
