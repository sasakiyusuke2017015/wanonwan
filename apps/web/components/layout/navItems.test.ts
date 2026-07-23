import { describe, it, expect } from "vitest";
import { NAV_ITEMS, NAV_GROUPS } from "./navItems";

describe("navItems", () => {
  it("NAV_ITEMS の全項目が NAV_GROUPS のどれかに属する", () => {
    // Sidebar は NAV_GROUPS 起点で描画するため、登録漏れの項目は
    // 下部タブには出るのに Sidebar からは静かに消える。
    const grouped = new Set(NAV_GROUPS.flatMap((g) => g.itemIds));
    const missing = NAV_ITEMS.filter((i) => !grouped.has(i.id)).map((i) => i.id);
    expect(missing).toEqual([]);
  });

  it("NAV_GROUPS が実在しない項目 id を参照しない", () => {
    const known = new Set(NAV_ITEMS.map((i) => i.id));
    const unknown = NAV_GROUPS.flatMap((g) => g.itemIds).filter((id) => !known.has(id));
    expect(unknown).toEqual([]);
  });
});
