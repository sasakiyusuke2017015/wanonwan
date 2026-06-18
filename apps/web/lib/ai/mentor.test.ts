import { describe, it, expect } from "vitest";
import { buildMentorPrompt } from "./mentor";

describe("buildMentorPrompt", () => {
  it("対象面談と類似面談を文脈に含める", () => {
    const p = buildMentorPrompt("対象メモ", ["過去A", "過去B"]);
    expect(p).toContain("対象メモ");
    expect(p).toContain("過去A");
    expect(p).toContain("過去B");
  });

  it("類似が無くても対象だけで成立する", () => {
    const p = buildMentorPrompt("対象メモ", []);
    expect(p).toContain("対象メモ");
    expect(typeof p).toBe("string");
  });
});
