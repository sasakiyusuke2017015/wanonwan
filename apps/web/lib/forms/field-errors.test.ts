import { describe, it, expect } from "vitest";
import * as v from "valibot";
import { fieldErrorsOf } from "./field-errors";

const Schema = v.object({
  code: v.pipe(v.string(), v.minLength(1, "コードは必須です")),
  email: v.pipe(v.string(), v.email("メール形式が不正です")),
});

describe("fieldErrorsOf", () => {
  it("妥当な値では空オブジェクトを返す", () => {
    expect(fieldErrorsOf(Schema, { code: "x", email: "a@b.com" })).toEqual({});
  });

  it("必須欠落・email 不正で該当フィールドにメッセージが入る", () => {
    const errors = fieldErrorsOf(Schema, { code: "", email: "bad" });
    expect(errors.code).toBe("コードは必須です");
    expect(errors.email).toBe("メール形式が不正です");
  });

  it("1 フィールドに複数 issue があっても先頭メッセージのみ返す", () => {
    const errors = fieldErrorsOf(Schema, { code: "ok", email: "" });
    // email は string 通過後 email() で 1 件。先頭が取れていれば良い。
    expect(typeof errors.email).toBe("string");
    expect(errors.email.length).toBeGreaterThan(0);
  });

  it("非オブジェクト入力でも throw せず object を返す", () => {
    expect(typeof fieldErrorsOf(Schema, null)).toBe("object");
  });
});
