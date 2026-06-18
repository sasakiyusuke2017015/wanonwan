import { describe, it, expect } from "vitest";
import { objectKeyFor } from "./keys";

describe("objectKeyFor", () => {
  it("entity ごとの prefix + id + uuid でキーを組む", () => {
    expect(objectKeyFor("interview", 5, "u1")).toBe("interviews/5/u1");
    expect(objectKeyFor("answer", 9, "u2")).toBe("answers/9/u2");
    expect(objectKeyFor("user_avatar", 3, "u3")).toBe("avatars/3/u3");
    expect(objectKeyFor("survey", 7, "u4")).toBe("surveys/7/u4");
  });
});
