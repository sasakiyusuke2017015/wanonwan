import { describe, it, expect, vi } from "vitest";

// env / jose 依存を避けるため mint をモックする。
vi.mock("@/lib/auth/provisioning", () => ({
  mintServiceRoleToken: vi.fn(async () => "test-token"),
}));

import { withServiceRole } from "@/lib/auth/service-role";
import { mintServiceRoleToken } from "@/lib/auth/provisioning";

describe("withServiceRole", () => {
  it("mints a token and passes it to fn, returning fn's result", async () => {
    const fn = vi.fn(async (token: string) => `used:${token}`);
    const result = await withServiceRole(fn);
    expect(mintServiceRoleToken).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("test-token");
    expect(result).toBe("used:test-token");
  });

  it("mints a fresh token on each call (inline 型・複数回 mint 可)", async () => {
    await withServiceRole(async () => undefined);
    await withServiceRole(async () => undefined);
    // 本テスト内で 2 回 + 前テストの 1 回
    expect(vi.mocked(mintServiceRoleToken).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
