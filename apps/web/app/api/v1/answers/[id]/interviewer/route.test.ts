import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthClaims } from "@/lib/auth/jwt";

// 面談担当の指名は admin 限定。tx 内判定（admin ゲート / 指名先 capability / 存在確認）の
// 分岐ごとのステータスコードを固定する。db は境界モックし、tx 内 SQL の結果は
// withUser の戻り値（outcome）で表現する。
vi.mock("@/lib/auth/current-user", async (imp) => {
  const actual = await imp<typeof import("@/lib/auth/current-user")>();
  return { ...actual, getCurrentClaims: vi.fn() };
});
vi.mock("@/lib/db/client", () => ({ withUser: vi.fn() }));

import { PUT } from "./route";
import { getCurrentClaims } from "@/lib/auth/current-user";
import { withUser } from "@/lib/db/client";

function claims(over: Partial<AuthClaims> = {}): AuthClaims {
  return { sub: "u1", email: "a@example.com", role: "authenticated", exp: 0, mustChangePassword: false, ...over };
}

function put(body: unknown) {
  return new Request("http://test/api/v1/answers/1/interviewer", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ctx = { params: Promise.resolve({ id: "1" }) };

beforeEach(() => {
  vi.mocked(getCurrentClaims).mockReset();
  vi.mocked(withUser).mockReset();
});

describe("PUT /api/v1/answers/[id]/interviewer", () => {
  it("未認証は 401（tx に到達しない）", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(null);
    const res = await PUT(put({ interviewerId: 2 }), ctx);
    expect(res.status).toBe(401);
    expect(withUser).not.toHaveBeenCalled();
  });

  it("body が不正（interviewerId 欠落）なら 400", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    const res = await PUT(put({}), ctx);
    expect(res.status).toBe(400);
    expect(withUser).not.toHaveBeenCalled();
  });

  it("非 admin は 403", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue({ kind: "forbidden" } as never);
    const res = await PUT(put({ interviewerId: 2 }), ctx);
    expect(res.status).toBe(403);
  });

  it("answer が存在しなければ 404", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue({ kind: "notfound" } as never);
    const res = await PUT(put({ interviewerId: 2 }), ctx);
    expect(res.status).toBe(404);
  });

  it("指名先が interviewer/admin 非保有なら 422", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue({ kind: "ineligible" } as never);
    const res = await PUT(put({ interviewerId: 2 }), ctx);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "指名先が面談担当（または管理者）の権限を持っていません",
    });
  });

  it("admin の指名成功は 200 + 更新後の担当を返す", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue({ kind: "ok", row: { id: 1, interviewerId: 2 } } as never);
    const res = await PUT(put({ interviewerId: 2 }), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { id: 1, interviewerId: 2 } });
  });

  it("null は担当解除として 200", async () => {
    vi.mocked(getCurrentClaims).mockResolvedValue(claims());
    vi.mocked(withUser).mockResolvedValue({ kind: "ok", row: { id: 1, interviewerId: null } } as never);
    const res = await PUT(put({ interviewerId: null }), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { id: 1, interviewerId: null } });
  });
});
