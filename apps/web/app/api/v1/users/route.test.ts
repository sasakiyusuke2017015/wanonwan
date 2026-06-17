import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthClaims } from "@/lib/auth/jwt";

// users POST は withActiveUser 配下。parseBody 通過後に tx 内 app.is_admin() で 403。
// 非 admin が valid body を送っても 403 で弾かれることを固定する。
vi.mock("@/lib/auth/current-user", async (imp) => {
  const actual = await imp<typeof import("@/lib/auth/current-user")>();
  return { ...actual, getCurrentClaims: vi.fn() };
});
vi.mock("@/lib/db/client", () => ({ withUser: vi.fn() }));
vi.mock("@/lib/auth/gotrue", () => ({
  gotrue: { admin: { createUser: vi.fn(), deleteUser: vi.fn() } },
}));
vi.mock("@/lib/auth/service-role", () => ({ withServiceRole: vi.fn() }));
vi.mock("@/lib/auth/provisioning", () => ({ generateInitialPassword: vi.fn(() => "pw-xxxx") }));

import { POST } from "./route";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";

function claims(over: Partial<AuthClaims> = {}): AuthClaims {
  return { sub: "u1", email: "a@example.com", role: "authenticated", exp: 0, mustChangePassword: false, ...over };
}

function post(body: unknown) {
  return new Request("http://test/api/v1/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(getCurrentClaims).mockReset();
  vi.mocked(withUser).mockReset();
});

describe("POST /api/v1/users の admin 403", () => {
  it("非 admin が valid body を送っても 403（GoTrue 発行に到達しない）", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    // tx 内 precheck: admin=false
    vi.mocked(withUser).mockResolvedValue({ admin: false, dup: false } as never);
    const res = await POST(post({ code: "c1", name: "山田", email: "y@example.com" }), undefined);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "権限がありません" });
  });

  it("未認証は withActiveUser が 401（precheck に到達しない）", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(null);
    const res = await POST(post({ code: "c1", name: "山田", email: "y@example.com" }), undefined);
    expect(res.status).toBe(401);
    expect(withUser).not.toHaveBeenCalled();
  });
});
