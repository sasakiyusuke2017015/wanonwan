import { describe, it, expect } from "vitest";
import { isDirtyPayload } from "./dirty";

describe("isDirtyPayload", () => {
  it("同一内容なら false", () => {
    expect(isDirtyPayload({ a: 1, b: "x" }, { a: 1, b: "x" })).toBe(false);
  });

  it("値が変われば true", () => {
    expect(isDirtyPayload({ a: 1 }, { a: 2 })).toBe(true);
  });

  it("キーの順序が違っても同一なら false（安定 stringify）", () => {
    expect(isDirtyPayload({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(false);
  });

  it("ネストしたオブジェクトのキー順序も無視する", () => {
    expect(
      isDirtyPayload({ o: { x: 1, y: 2 } }, { o: { y: 2, x: 1 } }),
    ).toBe(false);
  });

  it("配列は順序を保持して比較する（順序違いは dirty）", () => {
    expect(isDirtyPayload({ v: ["a", "b"] }, { v: ["a", "b"] })).toBe(false);
    expect(isDirtyPayload({ v: ["a", "b"] }, { v: ["b", "a"] })).toBe(true);
  });

  it("配列要素の増減を検知する", () => {
    expect(isDirtyPayload({ v: ["a"] }, { v: ["a", "b"] })).toBe(true);
  });

  it("undefined と null は同一視する（穴を揃える）", () => {
    expect(isDirtyPayload({ a: undefined }, { a: null })).toBe(false);
  });

  it("空オブジェクト同士は false", () => {
    expect(isDirtyPayload({}, {})).toBe(false);
  });

  it("フォームの空初期値と入力後で dirty を検知する", () => {
    const empty = { title: "", status: "draft", capacity: "" };
    const edited = { title: "面談", status: "draft", capacity: "" };
    expect(isDirtyPayload(empty, empty)).toBe(false);
    expect(isDirtyPayload(edited, empty)).toBe(true);
  });
});
