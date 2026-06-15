import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";
import type { AuthClaims } from "@/lib/auth/jwt";

// getCurrentClaims（cookies 依存）だけモックし、forceChangeGuard は実物を使う。
vi.mock("@/lib/auth/current-user", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/auth/current-user")>();
  return { ...actual, getCurrentClaims: vi.fn() };
});

import { withActiveUser } from "@/lib/auth/route";
import { getCurrentClaims } from "@/lib/auth/current-user";

function mockClaims(over: Partial<AuthClaims> = {}): AuthClaims {
  return {
    sub: "u1",
    email: "a@example.com",
    role: "authenticated",
    exp: 0,
    mustChangePassword: false,
    ...over,
  };
}

const req = () => new Request("http://test/api");

describe("withActiveUser", () => {
  it("returns 401 when unauthenticated and does not call the handler", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(null);
    const handler = vi.fn();
    const res = await withActiveUser(handler)(req(), undefined);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthenticated" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 403 when the user must change password and does not call the handler", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(mockClaims({ mustChangePassword: true }));
    const handler = vi.fn();
    const res = await withActiveUser(handler)(req(), undefined);
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "must_change_password" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls the handler with (req, claims, ctx) for an active user", async () => {
    const claims = mockClaims();
    vi.mocked(getCurrentClaims).mockResolvedValue(claims);
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const r = req();
    const ctx = { params: Promise.resolve({ id: "9" }) };
    const res = await withActiveUser(handler)(r, ctx);
    expect(handler).toHaveBeenCalledWith(r, claims, ctx);
    expect(await res.json()).toEqual({ ok: true });
  });
});
