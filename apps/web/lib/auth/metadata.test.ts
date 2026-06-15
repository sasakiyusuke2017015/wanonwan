import { describe, it, expect } from "vitest";
import {
  MUST_CHANGE_PASSWORD_KEY,
  mustChangeAppMetadata,
  readMustChangePassword,
} from "@/lib/auth/metadata";

describe("metadata", () => {
  it("mustChangeAppMetadata builds the flag object", () => {
    expect(mustChangeAppMetadata(true)).toEqual({ [MUST_CHANGE_PASSWORD_KEY]: true });
    expect(mustChangeAppMetadata(false)).toEqual({ [MUST_CHANGE_PASSWORD_KEY]: false });
  });

  it("readMustChangePassword is true only for strict === true", () => {
    expect(readMustChangePassword({ must_change_password: true })).toBe(true);
    expect(readMustChangePassword({ must_change_password: false })).toBe(false);
    // 文字列 "true" / 1 など truthy でも真にしない
    expect(readMustChangePassword({ must_change_password: "true" })).toBe(false);
    expect(readMustChangePassword({ must_change_password: 1 })).toBe(false);
    expect(readMustChangePassword({})).toBe(false);
    expect(readMustChangePassword(null)).toBe(false);
    expect(readMustChangePassword(undefined)).toBe(false);
    expect(readMustChangePassword("x")).toBe(false);
  });
});
