import { describe, it, expect } from "vitest";
import { filterRows, sortRows } from "./filter-sort";

type Row = { id: number; name: string; code: string; age: number | null };

const rows: Row[] = [
  { id: 1, name: "山田太郎", code: "B", age: 30 },
  { id: 2, name: "鈴木花子", code: "A", age: 20 },
  { id: 3, name: "佐藤次郎", code: "C", age: null },
];

describe("filterRows", () => {
  it("空クエリは全件を素通し", () => {
    expect(filterRows(rows, "", ["name", "code"])).toHaveLength(3);
    expect(filterRows(rows, "   ", ["name"])).toHaveLength(3);
  });

  it("指定列を横断して部分一致（大小無視）", () => {
    expect(filterRows(rows, "花子", ["name"])).toEqual([rows[1]]);
    expect(filterRows(rows, "b", ["code"]).map((r) => r.id)).toEqual([1]);
  });

  it("どの指定列にも一致しなければ空", () => {
    expect(filterRows(rows, "zzz", ["name", "code"])).toEqual([]);
  });
});

describe("sortRows", () => {
  it("key 無しは原順を保つ", () => {
    expect(sortRows(rows, null, "asc").map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it("数値 昇順 / 降順（null は末尾）", () => {
    expect(sortRows(rows, "age", "asc").map((r) => r.id)).toEqual([2, 1, 3]);
    expect(sortRows(rows, "age", "desc").map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it("文字列 昇順（localeCompare）", () => {
    expect(sortRows(rows, "code", "asc").map((r) => r.code)).toEqual(["A", "B", "C"]);
    expect(sortRows(rows, "code", "desc").map((r) => r.code)).toEqual(["C", "B", "A"]);
  });

  it("元配列を破壊しない", () => {
    const before = rows.map((r) => r.id);
    sortRows(rows, "code", "desc");
    expect(rows.map((r) => r.id)).toEqual(before);
  });
});
