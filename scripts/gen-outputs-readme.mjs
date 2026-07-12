// outputs/README.md（ステータスダッシュボード）を Plan ヘッダから生成する。
// 設計: outputs/plans/2026-07-06-plan-doc-model/06-final-design.md
// 使い方: node scripts/gen-outputs-readme.mjs        … outputs/README.md を書き換え
//         node scripts/gen-outputs-readme.mjs --stdout … 標準出力のみ（検証用）
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const plansDir = join(root, "outputs", "plans");
const readmePath = join(root, "outputs", "README.md");
const toStdout = process.argv.includes("--stdout");

function cell(src, name) {
  const m = src.match(new RegExp(`^\\|\\s*${name}\\s*\\|(.+)\\|\\s*$`, "m"));
  return m ? m[1].trim() : "";
}

const files = readdirSync(plansDir)
  .filter((f) => f.endsWith(".md") && f !== "_template.md")
  .sort();

const rows = [];
const problems = [];
for (const f of files) {
  const src = readFileSync(join(plansDir, f), "utf8");
  const title = (src.match(/^#\s+(?:Plan:\s*)?(.+)$/m)?.[1] ?? f).trim();
  // Plan ヘッダ内のリンクは plans/ 起点（../reviews/ 等）。README は outputs/ 起点なので付け替える。
  const gaiyo = cell(src, "概要").replaceAll("](../", "](");
  const status = cell(src, "ステータス");
  const pr = cell(src, "PR").replaceAll("](../", "](");
  const review = cell(src, "Review").replaceAll("](../", "](");
  if (!gaiyo) problems.push(`${f}: 概要が空`);
  if (!status) problems.push(`${f}: ステータスが空`);
  rows.push(
    `| ${status} | [${title}](plans/${f}) | ${gaiyo} | ${pr || "—"} | ${review || "—"} |`,
  );
}

if (problems.length) {
  console.error("生成中止（Plan ヘッダの不備）:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

const out = `<!-- 自動生成。手編集しない。再生成: node scripts/gen-outputs-readme.mjs -->

# outputs — Plan / Review ダッシュボード

Plan は [\`plans/\`](plans/)、Review は [\`reviews/\`](reviews/) に保存する。運用ルールは
[\`.claude/rules/plan-review-workflow.md\`](../.claude/rules/plan-review-workflow.md)、
本ダッシュボードの設計は [\`06-final-design\`](plans/2026-07-06-plan-doc-model/06-final-design.md)。

各行は **Plan ヘッダ（概要 / ステータス / PR / Review）の投影**。値を直したいときは
対象 Plan のヘッダを更新してから再生成する。

## ステータスダッシュボード

| ステータス | Plan | 概要 | PR | Review |
|---|---|---|---|---|
${rows.join("\n")}
`;

if (toStdout) process.stdout.write(out);
else {
  writeFileSync(readmePath, out);
  console.log(`outputs/README.md を生成（${rows.length} Plan）`);
}
