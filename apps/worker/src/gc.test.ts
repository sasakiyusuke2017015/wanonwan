import { describe, it, expect } from "vitest";
import { parseGcMessage } from "./gc.ts";

describe("parseGcMessage", () => {
  it("bucket / object_key を取り出す", () => {
    expect(parseGcMessage({ bucket: "waoon", object_key: "interviews/x/obj-1" })).toEqual({
      bucket: "waoon",
      objectKey: "interviews/x/obj-1",
    });
  });

  it("余分なキーがあっても必要な 2 つを取り出す", () => {
    expect(parseGcMessage({ bucket: "waoon", object_key: "k", extra: 1 })).toEqual({
      bucket: "waoon",
      objectKey: "k",
    });
  });

  it.each([
    ["null", null],
    ["非オブジェクト", "string"],
    ["bucket 欠落", { object_key: "k" }],
    ["object_key 欠落", { bucket: "waoon" }],
    ["空文字", { bucket: "", object_key: "k" }],
    ["型違い", { bucket: "waoon", object_key: 123 }],
  ])("不正な形は例外: %s", (_label, input) => {
    expect(() => parseGcMessage(input)).toThrow();
  });
});
