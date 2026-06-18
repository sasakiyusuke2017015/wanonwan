import { describe, it, expect } from "vitest";
import { buildEmbedInput, parseEmbedding, toVectorLiteral } from "./embed";

describe("buildEmbedInput", () => {
  it("e5 系の prefix（query:/passage:）を付ける", () => {
    expect(buildEmbedInput("やあ", "query")).toBe("query: やあ");
    expect(buildEmbedInput("メモ", "passage")).toBe("passage: メモ");
  });
});

describe("parseEmbedding", () => {
  it("TEI の number[][] から先頭ベクトルを取り出す", () => {
    expect(parseEmbedding([[0.1, 0.2, 0.3]])).toEqual([0.1, 0.2, 0.3]);
  });
  it("想定外の形は例外", () => {
    expect(() => parseEmbedding([])).toThrow();
    expect(() => parseEmbedding({} as never)).toThrow();
  });
});

describe("toVectorLiteral", () => {
  it("pgvector のテキストリテラル [a,b,c] にする", () => {
    expect(toVectorLiteral([0.1, 0.2, 0.3])).toBe("[0.1,0.2,0.3]");
  });
});
