import { describe, it, expect } from "vitest";
import * as v from "valibot";
import { NextResponse } from "next/server";
import { parseBody } from "@/lib/api/request";

const Schema = v.object({ name: v.pipe(v.string(), v.minLength(1)) });

function jsonReq(body: unknown) {
  return new Request("http://test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("parseBody", () => {
  it("returns validated data on a valid body", async () => {
    const result = await parseBody(jsonReq({ name: "alice" }), Schema);
    expect(result).toEqual({ name: "alice" });
  });

  it("returns 400 with the default message on an invalid body", async () => {
    const result = await parseBody(jsonReq({ name: "" }), Schema);
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "入力が不正です" });
  });

  it("uses the provided custom error message", async () => {
    const result = await parseBody(jsonReq({}), Schema, "メールアドレスとパスワードを入力してください");
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "メールアドレスとパスワードを入力してください" });
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const bad = new Request("http://test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    });
    const result = await parseBody(bad, Schema);
    expect((result as NextResponse).status).toBe(400);
  });
});
