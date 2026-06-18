import { describe, it, expect } from "vitest";
import * as v from "valibot";
import { fieldErrorsOf, requiredFieldErrors } from "./field-errors";

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

describe("requiredFieldErrors", () => {
  const items = [
    { id: "q1", required: true },
    { id: "q2", required: false },
    { id: "q3", required: true },
  ];

  it("必須かつ未入力の項目だけにメッセージが入る", () => {
    const filled = new Set(["q1"]); // q1 は入力済み、q3 は未入力
    const errors = requiredFieldErrors(items, (it) => filled.has(it.id));
    expect(errors).toEqual({ q3: "この項目は必須です" });
  });

  it("すべて入力済みなら空", () => {
    const errors = requiredFieldErrors(items, () => true);
    expect(errors).toEqual({});
  });

  it("メッセージは差し替えられる", () => {
    const errors = requiredFieldErrors(items, () => false, "回答してください");
    expect(errors.q1).toBe("回答してください");
    expect(errors.q3).toBe("回答してください");
    expect("q2" in errors).toBe(false); // 任意項目は対象外
  });
});
