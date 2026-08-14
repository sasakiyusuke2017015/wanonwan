import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import type { AuthClaims } from "@/lib/auth/jwt";

// ゲートの順序（429 → 401 → 400）を固定する。到達しない外部依存はスタブ化して
// import 時副作用を断つ。rate-limit / current-user は挙動を制御する。
vi.mock("@/lib/auth/rate-limit", async (imp) => {
  const actual = await imp<typeof import("@/lib/auth/rate-limit")>();
  return { ...actual, checkRateLimit: vi.fn() };
});
vi.mock("@/lib/auth/current-user", async (imp) => {
  const actual = await imp<typeof import("@/lib/auth/current-user")>();
  return { ...actual, getCurrentClaims: vi.fn() };
});
vi.mock("@/lib/auth/gotrue", () => {
  const client = { signInWithPassword: vi.fn(), admin: { updateUser: vi.fn() } };
  return { gotrue: () => client };
});
vi.mock("@/lib/auth/service-role", () => ({ withServiceRole: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ setSession: vi.fn() }));

import { POST } from "./route";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentClaims } from "@/lib/auth/current-user";

function claims(over: Partial<AuthClaims> = {}): AuthClaims {
  return { sub: "u1", email: "a@example.com", role: "authenticated", exp: 0, mustChangePassword: false, ...over };
}

function post(body: unknown) {
  return new Request("http://test/api/v1/auth/change-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(checkRateLimit).mockReset();
  vi.mocked(getCurrentClaims).mockReset();
});

describe("POST /api/v1/auth/change-password ゲート順序", () => {
  it("rate-limit 超過は最外で 429。認証も検証も行わない", async () => {
    vi.mocked(checkRateLimit).mockReturnValue(NextResponse.json({ error: "too many" }, { status: 429 }));
    const res = await POST(post({ currentPassword: "x", newPassword: "y".repeat(12) }));
    expect(res.status).toBe(429);
    expect(getCurrentClaims).not.toHaveBeenCalled();
  });

  it("rate-limit 通過後、未認証なら 401（body 検証より前）", async () => {
    vi.mocked(checkRateLimit).mockReturnValue(null);
    vi.mocked(getCurrentClaims).mockResolvedValue(null);
    const res = await POST(post({})); // body は不正だが 401 が先に返る
    expect(res.status).toBe(401);
  });

  it("認証済みだが email 欠落トークンは 401", async () => {
    vi.mocked(checkRateLimit).mockReturnValue(null);
    vi.mocked(getCurrentClaims).mockResolvedValue(claims({ email: undefined }));
    const res = await POST(post({ currentPassword: "x", newPassword: "y".repeat(12) }));
    expect(res.status).toBe(401);
  });

  it("認証済み + body 不正なら 400", async () => {
    vi.mocked(checkRateLimit).mockReturnValue(null);
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    const res = await POST(post({ currentPassword: "", newPassword: "short" }));
    expect(res.status).toBe(400);
  });
});
