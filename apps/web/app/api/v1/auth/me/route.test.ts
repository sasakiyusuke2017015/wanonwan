import { describe, it, expect, vi, beforeEach } from "vitest";

// me は独自実装（withActiveUser を使わない）。トークン無し / 検証失敗の 2 種 401 と
// 検証成功時の業務属性解決を固定する。session / jwt / db を境界モックする。
vi.mock("@/lib/auth/session", () => ({ getAccessToken: vi.fn() }));
vi.mock("@/lib/auth/jwt", () => ({ verifyAccessToken: vi.fn() }));
vi.mock("@/lib/db/client", () => ({ withUser: vi.fn() }));

import { GET } from "./route";
import { getAccessToken } from "@/lib/auth/session";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withUser } from "@/lib/db/client";

beforeEach(() => {
  vi.mocked(getAccessToken).mockReset();
  vi.mocked(verifyAccessToken).mockReset();
  vi.mocked(withUser).mockReset();
});

describe("GET /api/v1/auth/me の 401 2 種", () => {
  it("アクセストークンが無いと 401 (unauthenticated)", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(undefined);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthenticated" });
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("トークン検証が失敗すると 401 (invalid token)", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("bad-token");
    vi.mocked(verifyAccessToken).mockRejectedValue(new Error("bad"));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "invalid token" });
    expect(withUser).not.toHaveBeenCalled();
  });

  it("検証成功なら RLS コンテキストで業務属性を返す", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("ok-token");
    vi.mocked(verifyAccessToken).mockResolvedValue({
      sub: "u1",
      email: "a@example.com",
      role: "authenticated",
      exp: 0,
      mustChangePassword: false,
    });
    vi.mocked(withUser).mockResolvedValue([{ isAdmin: true, userId: 42, name: "Alice" }] as never);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      user: { id: "u1", email: "a@example.com", role: "authenticated" },
      userId: 42,
      name: "Alice",
      isAdmin: true,
    });
  });
});
