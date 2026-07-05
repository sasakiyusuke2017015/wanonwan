import { describe, it, expect } from "vitest";
import { urgencyBadgeColor } from "./color";

describe("urgencyBadgeColor", () => {
  it("3 段階（低/中/高）は green / yellow / red に割り当たる", () => {
    const codes = [1, 2, 3];
    expect(urgencyBadgeColor(1, codes)).toBe("green");
    expect(urgencyBadgeColor(2, codes)).toBe("yellow");
    expect(urgencyBadgeColor(3, codes)).toBe("red");
  });

  it("code の絶対値でなく相対順位で決まる（飛び番でも同じ）", () => {
    const codes = [10, 50, 90];
    expect(urgencyBadgeColor(10, codes)).toBe("green");
    expect(urgencyBadgeColor(50, codes)).toBe("yellow");
    expect(urgencyBadgeColor(90, codes)).toBe("red");
  });

  it("2 段階は下位=green / 上位=red", () => {
    const codes = [1, 2];
    expect(urgencyBadgeColor(1, codes)).toBe("green");
    expect(urgencyBadgeColor(2, codes)).toBe("red");
  });

  it("4 段階は端が green/red、中間が yellow", () => {
    const codes = [1, 2, 3, 4];
    expect(urgencyBadgeColor(1, codes)).toBe("green");
    expect(urgencyBadgeColor(2, codes)).toBe("yellow");
    expect(urgencyBadgeColor(3, codes)).toBe("red");
    expect(urgencyBadgeColor(4, codes)).toBe("red");
  });

  it("マスタに無い code は gray", () => {
    expect(urgencyBadgeColor(99, [1, 2, 3])).toBe("gray");
  });

  it("単一段階・空マスタは gray（相対順位が定義できない）", () => {
    expect(urgencyBadgeColor(1, [1])).toBe("gray");
    expect(urgencyBadgeColor(1, [])).toBe("gray");
  });
});
