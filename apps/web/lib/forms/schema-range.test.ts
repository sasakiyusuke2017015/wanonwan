import { describe, it, expect } from "vitest";
import * as v from "valibot";
import { CreateSurveySchema, RecordInterviewSchema } from "@wanonwan/domain";
import { fieldErrorsOf } from "./field-errors";

describe("CreateSurveySchema 定員 range", () => {
  it("capacity 0 はフィールドエラー", () => {
    const errs = fieldErrorsOf(CreateSurveySchema, { title: "x", capacity: 0 });
    expect(errs.capacity).toBe("定員は 1 以上で入力してください");
  });

  it("capacity 1 以上は通る", () => {
    expect(fieldErrorsOf(CreateSurveySchema, { title: "x", capacity: 3 })).toEqual({});
  });

  it("capacity 未指定（任意）は通る", () => {
    expect(fieldErrorsOf(CreateSurveySchema, { title: "x" })).toEqual({});
  });
});

describe("RecordInterviewSchema 評価 range（0〜5）", () => {
  it("0〜5 は成功", () => {
    const r = v.safeParse(RecordInterviewSchema, { evaluation: { satisfaction: 0, stress: 5 } });
    expect(r.success).toBe(true);
  });

  it("範囲外（>5 / <0）は失敗", () => {
    expect(v.safeParse(RecordInterviewSchema, { evaluation: { satisfaction: 6 } }).success).toBe(false);
    expect(v.safeParse(RecordInterviewSchema, { evaluation: { stress: -1 } }).success).toBe(false);
  });
});
