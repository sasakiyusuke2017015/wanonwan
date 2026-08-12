// master ステップ: 組織マスタ 5 表（divisions / departments / sections / positions / urgency_levels）。
//
// 冪等性はテーブル単位の「非空スキップ」。CSV が真実の源になるのは空 DB の初回のみで、
// 運用開始後（管理画面で編集・削除した後）の再投入は no-op になる。これにより画面で DELETE した
// 行が CSV 残存で復活するのを防ぐ（ON CONFLICT DO NOTHING だけでは、消えた行は conflict しない）。
import { join } from "node:path";
import { root } from "../lib/cli.mjs";
import { readCsv } from "../lib/csv.mjs";
import { intLiteral, refSubquery, rowCount, sqlInList, sqlStr } from "../lib/psql.mjs";

const masterDir = join(root, "packages", "db", "seed", "master");

// FK 依存順。build は 1 行を VALUES 用の式リストへ変換する。
const TABLES = [
  {
    table: "divisions",
    columns: ["code", "name"],
    build: (r) => [sqlStr(r.code), sqlStr(r.name)],
  },
  {
    table: "departments",
    columns: ["code", "name", "division_id"],
    build: (r) => [sqlStr(r.code), sqlStr(r.name), refSubquery("divisions", r.division_code)],
  },
  {
    table: "sections",
    columns: ["code", "name", "department_id"],
    build: (r) => [sqlStr(r.code), sqlStr(r.name), refSubquery("departments", r.department_code)],
  },
  {
    table: "positions",
    columns: ["code", "name"],
    build: (r) => [intLiteral(r.code, "positions.code"), sqlStr(r.name)], // code は int
  },
  {
    table: "urgency_levels",
    columns: ["code", "name"],
    build: (r) => [intLiteral(r.code, "urgency_levels.code"), sqlStr(r.name)], // code は int
  },
];

export function provision({ psql }) {
  let total = 0;
  for (const def of TABLES) {
    const existing = rowCount(psql, def.table);
    if (existing > 0) {
      console.log(`• ${def.table}: 既存 ${existing} 行 → スキップ（初回投入専用）`);
      continue;
    }
    const rows = readCsv(join(masterDir, `${def.table}.csv`));
    for (const r of rows) {
      psql(
        `INSERT INTO public.${def.table} (${def.columns.join(", ")})
         VALUES (${def.build(r).join(", ")}) ON CONFLICT (code) DO NOTHING;`,
      );
    }
    console.log(`• ${def.table}: ${rows.length} 行を投入`);
    total += rows.length;
  }
  return total;
}

// seed 由来の行 = CSV の自然キー（code）に一致する行。画面で追加された行は対象外。
// 配列順 = 削除順（FK 依存の逆順: sections → departments → divisions）。
export function seedSets() {
  return [...TABLES]
    .reverse()
    .map((def) => ({
      table: def.table,
      where: `code IN ${sqlInList(readCsv(join(masterDir, `${def.table}.csv`)).map((r) => r.code))}`,
    }));
}
