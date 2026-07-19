import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthClaims } from "@/lib/auth/jwt";

// アクティブロール切替は保有ロールのみ許可（非保有 422 = 表示上も保有外視点を作らせない）。
// cookie 書き込みと DB は境界モックする。
vi.mock("@/lib/auth/current-user", async (imp) => {
  const actual = await imp<typeof import("@/lib/auth/current-user")>();
  return { ...actual, getCurrentClaims: vi.fn() };
});
vi.mock("@/lib/db/client", () => ({ withUser: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ setActiveRoleCookie: vi.fn() }));

import { PUT } from "./route";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";
import { setActiveRoleCookie } from "@/lib/auth/session";

function claims(over: Partial<AuthClaims> = {}): AuthClaims {
  return { sub: "u1", email: "a@example.com", role: "authenticated", exp: 0, mustChangePassword: false, ...over };
}

function put(body: unknown) {
  return new Request("http://test/api/v1/auth/active-role", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(getCurrentClaims).mockReset();
  vi.mocked(withUser).mockReset();
  vi.mocked(setActiveRoleCookie).mockReset();
});

describe("PUT /api/v1/auth/active-role", () => {
  it("未認証は 401", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(null);
    const res = await PUT(put({ role: "member" }), undefined);
    expect(res.status).toBe(401);
    expect(setActiveRoleCookie).not.toHaveBeenCalled();
  });

  it("不正な role 値は 400（picklist 外）", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    const res = await PUT(put({ role: "superuser" }), undefined);
    expect(res.status).toBe(400);
    expect(withUser).not.toHaveBeenCalled();
  });

  it("保有していないロールへの切替は 422（cookie を書かない）", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue([{ elevated: [] }] as never); // member のみ保有
    const res = await PUT(put({ role: "admin" }), undefined);
    expect(res.status).toBe(422);
    expect(setActiveRoleCookie).not.toHaveBeenCalled();
  });

  it("保有ロールへの切替は 200 + cookie 保存", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue([{ elevated: ["interviewer"] }] as never);
    const res = await PUT(put({ role: "interviewer" }), undefined);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { activeRole: "interviewer" } });
    expect(setActiveRoleCookie).toHaveBeenCalledWith("interviewer");
  });

  it("member への切替は常に可（全員が暗黙保有）", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue([{ elevated: ["admin"] }] as never);
    const res = await PUT(put({ role: "member" }), undefined);
    expect(res.status).toBe(200);
    expect(setActiveRoleCookie).toHaveBeenCalledWith("member");
  });
});
