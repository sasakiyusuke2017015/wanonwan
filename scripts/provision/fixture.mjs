// fixture ステップ（dev 専用）: packages/db/seed/*.sql を昇順に適用する。
//
// RLS テスト（pgTAP）が前提にする最小の実データ（member1 の回答 / interviewer1 = 閲覧者）を作る。
// SQL 自体が WHERE NOT EXISTS / ON CONFLICT で冪等なため、ステップ側では番兵を持たない。
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "../lib/cli.mjs";
import { sqlStr } from "../lib/psql.mjs";

const seedDir = join(root, "packages", "db", "seed");

// 20_sample.sql が作るサンプルアンケートのタイトル。fixture の痕跡を検出する目印。
const SAMPLE_SURVEY_TITLE = "サンプル面談アンケート";

export function provision({ psql }) {
  const files = readdirSync(seedDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    psql(readFileSync(join(seedDir, file), "utf8"));
    console.log(`• fixture: ${file} を適用`);
  }
  return files.length;
}

// fixture は deprovision alias を持たない（dev 専用。作り直しは `compose down -v`）。
// ここで返す集合は **依存 seed の残存チェック専用** で、削除には使わない。
export function seedSets() {
  const survey = `(SELECT id FROM public.surveys WHERE title = ${sqlStr(SAMPLE_SURVEY_TITLE)})`;
  return [
    { table: "answers", where: `publication_id IN (SELECT id FROM public.survey_publications WHERE survey_id IN ${survey})` },
    { table: "survey_publications", where: `survey_id IN ${survey}` },
    { table: "surveys", where: `title = ${sqlStr(SAMPLE_SURVEY_TITLE)}` },
  ];
}
