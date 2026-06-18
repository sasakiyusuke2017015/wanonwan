import { describe, it, expect } from "vitest";
import { jstInputToUtcIso, utcIsoToJstInput, formatJstDateTime } from "./datetime";

describe("jstInputToUtcIso", () => {
  it("JST 壁時計を UTC ISO に変換する（9 時間引く）", () => {
    expect(jstInputToUtcIso("2026-06-18T09:00")).toBe("2026-06-18T00:00:00.000Z");
  });

  it("日付をまたぐ早朝も正しく前日 UTC になる", () => {
    expect(jstInputToUtcIso("2026-06-18T05:00")).toBe("2026-06-17T20:00:00.000Z");
  });

  it("秒以下は分に丸める", () => {
    expect(jstInputToUtcIso("2026-06-18T09:00:45")).toBe("2026-06-18T00:00:00.000Z");
  });

  it("空・無効は null", () => {
    expect(jstInputToUtcIso(null)).toBeNull();
    expect(jstInputToUtcIso("")).toBeNull();
    expect(jstInputToUtcIso(undefined)).toBeNull();
    expect(jstInputToUtcIso("not-a-date")).toBeNull();
  });
});

describe("utcIsoToJstInput", () => {
  it("UTC ISO を JST 壁時計（datetime-local）に戻す（9 時間足す）", () => {
    expect(utcIsoToJstInput("2026-06-18T00:00:00.000Z")).toBe("2026-06-18T09:00");
  });

  it("前日 UTC は当日 JST 早朝になる", () => {
    expect(utcIsoToJstInput("2026-06-17T20:00:00.000Z")).toBe("2026-06-18T05:00");
  });

  it("空・無効は空文字", () => {
    expect(utcIsoToJstInput(null)).toBe("");
    expect(utcIsoToJstInput("")).toBe("");
    expect(utcIsoToJstInput("bad")).toBe("");
  });
});

describe("formatJstDateTime", () => {
  it("UTC ISO を 'YYYY-MM-DD HH:mm'（JST）で表示する", () => {
    expect(formatJstDateTime("2026-06-18T00:00:00.000Z")).toBe("2026-06-18 09:00");
  });

  it("空・無効は空文字", () => {
    expect(formatJstDateTime(null)).toBe("");
    expect(formatJstDateTime("bad")).toBe("");
  });
});

describe("round-trip", () => {
  it("JST 壁時計 → UTC → JST 壁時計 で値が保たれる", () => {
    const wall = "2026-12-31T23:30";
    expect(utcIsoToJstInput(jstInputToUtcIso(wall))).toBe(wall);
  });
});
