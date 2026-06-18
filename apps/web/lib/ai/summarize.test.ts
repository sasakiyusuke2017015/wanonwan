import { describe, it, expect } from "vitest";
import { buildSummaryPrompt, extractText } from "./summarize";

describe("buildSummaryPrompt", () => {
  it("面談本文をプロンプトに含める", () => {
    const p = buildSummaryPrompt("メモ本文です");
    expect(p).toContain("メモ本文です");
  });
});

describe("extractText", () => {
  it("text ブロックのみを連結し、他種は無視する", () => {
    const blocks = [
      { type: "text", text: "要約A" },
      { type: "tool_use", text: undefined },
      { type: "text", text: "要約B" },
    ];
    expect(extractText(blocks)).toBe("要約A\n要約B");
  });

  it("text が空のブロックは無視する", () => {
    const blocks = [
      { type: "text", text: "" },
      { type: "text", text: "本体" },
    ];
    expect(extractText(blocks)).toBe("本体");
  });

  it("text ブロックが無ければ空文字", () => {
    expect(extractText([{ type: "thinking" }])).toBe("");
  });
});
