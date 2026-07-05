import { describe, it, expect } from "vitest";
import { answerState, deadlineInfo } from "./status";

// オフセットなしの文字列 = 実行環境のローカル時刻として解釈される。
// deadlineInfo はローカル TZ の日付粒度で判定する仕様のため、テストも
// ローカル時刻で組み立てて TZ 非依存にする（CI は UTC、開発機は JST）。
const now = new Date("2026-07-05T10:00:00");

describe("deadlineInfo", () => {
  it("end_at 未設定は null", () => {
    expect(deadlineInfo(null, now)).toBeNull();
  });

  it("締切まで 4 日以上は null（強調しない）", () => {
    expect(deadlineInfo("2026-07-09T23:59:59", now)).toBeNull();
  });

  it("締切まで 1〜3 日は「あと N 日」(orange)", () => {
    expect(deadlineInfo("2026-07-08T23:59:59", now)).toEqual({
      label: "あと3日",
      color: "orange",
    });
    expect(deadlineInfo("2026-07-06T09:00:00", now)).toEqual({
      label: "あと1日",
      color: "orange",
    });
  });

  it("本日締切は「本日締切」(red)", () => {
    expect(deadlineInfo("2026-07-05T23:59:59", now)).toEqual({
      label: "本日締切",
      color: "red",
    });
    // 同日なら時刻が現在より前でも「本日締切」（日付粒度で判定）
    expect(deadlineInfo("2026-07-05T00:00:00", now)).toEqual({
      label: "本日締切",
      color: "red",
    });
  });

  it("締切日を過ぎたら「締切超過」(gray)", () => {
    expect(deadlineInfo("2026-07-04T23:59:59", now)).toEqual({
      label: "締切超過",
      color: "gray",
    });
  });
});

describe("answerState", () => {
  it("回答レコードなしは none", () => {
    expect(answerState(null, null)).toBe("none");
  });

  it("回答レコードあり・未提出 (status 100) は draft", () => {
    expect(answerState("a1", 100)).toBe("draft");
  });

  it("提出済み (status 200) は submitted", () => {
    expect(answerState("a1", 200)).toBe("submitted");
  });

  it("面談調整済 (400) / 完了 (900) も submitted 扱い", () => {
    expect(answerState("a1", 400)).toBe("submitted");
    expect(answerState("a1", 900)).toBe("submitted");
  });

  it("status 不明 (null) でもレコードがあれば draft 扱い", () => {
    expect(answerState("a1", null)).toBe("draft");
  });
});
