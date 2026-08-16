// outputs/README.md（ステータスダッシュボード）を Plan ヘッダから生成する。
// 設計: outputs/plans/2026-07-06-plan-doc-model/06-final-design.md
// 使い方: node scripts/gen-outputs-readme.mjs        … outputs/README.md を書き換え
//         node scripts/gen-outputs-readme.mjs --stdout … 標準出力のみ（検証用）
//         node scripts/gen-outputs-readme.mjs --check  … 再生成せず drift だけ検査
// 終了コード: 0 = 正常 / 1 = Plan ヘッダの不備 / 2 = --check で drift 検出
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const plansDir = join(root, "outputs", "plans");
const readmePath = join(root, "outputs", "README.md");
const toStdout = process.argv.includes("--stdout");
const toCheck = process.argv.includes("--check");

// GitHub Actions のログにアノテーションとして出す。ローカルでは素の 1 行。
const ciPrefix = process.env.GITHUB_ACTIONS ? "::error::" : "";

const VERIFYING = "🟢 マージ済み（検証中）";
const DONE = "✅ 検証完了";

// Plan 内のリンクは plans/ 起点（`../reviews/x.md` / `2026-...-plan.md`）。README は outputs/ 起点。
function rebaseLinks(s) {
  return s.replaceAll("](../", "](").replace(/\]\((?=\d{4}-)/g, "](plans/");
}

function cell(src, name) {
  const m = src.match(new RegExp(`^\\|\\s*${name}\\s*\\|(.+)\\|\\s*$`, "m"));
  return m ? rebaseLinks(m[1].trim()) : "";
}

// Plan 末尾の「ステータス」セクション（`## ステータス` / `## 8. ステータス`）から
// 未チェック項目を、入れ子の深さを保ったまま拾う。
function unresolvedChecks(src) {
  const heading = src.match(/^##\s+(?:\d+\.\s*)?ステータス[^\n]*\n([\s\S]*)$/m);
  if (!heading) return [];
  const section = heading[1].split(/^##\s/m)[0];
  return section
    .split("\n")
    .map((line) => line.match(/^(\s*)- \[ \] (.+)$/))
    .filter(Boolean)
    .map((m) => ({ indent: m[1].length, text: rebaseLinks(m[2].trim()) }));
}

const files = readdirSync(plansDir)
  .filter((f) => f.endsWith(".md") && f !== "_template.md")
  .sort();

const rows = [];
const pending = [];
const problems = [];
const warnings = [];
for (const f of files) {
  const src = readFileSync(join(plansDir, f), "utf8");
  const title = (src.match(/^#\s+(?:Plan:\s*)?(.+)$/m)?.[1] ?? f).trim();
  const gaiyo = cell(src, "概要");
  const status = cell(src, "ステータス");
  const pr = cell(src, "PR");
  const review = cell(src, "Review");
  if (!gaiyo) problems.push(`${f}: 概要が空`);
  if (!status) problems.push(`${f}: ステータスが空`);
  rows.push(
    `| ${status} | [${title}](plans/${f}) | ${gaiyo} | ${pr || "—"} | ${review || "—"} |`,
  );

  const checks = unresolvedChecks(src);
  if (status === VERIFYING) {
    if (checks.length) pending.push({ title, file: f, checks });
    else warnings.push(`${f}: ${VERIFYING} だが未チェック項目が無い → ${DONE} に上げられる`);
  } else if (status === DONE && checks.length) {
    warnings.push(`${f}: ${DONE} だが未チェック項目が ${checks.length} 件残っている`);
  }
}

if (problems.length) {
  console.error(`${ciPrefix}生成中止（Plan ヘッダの不備）。対象 Plan のヘッダを直してください:`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

const pendingSection = pending.length
  ? pending
      .map(
        ({ title, file, checks }) =>
          `### [${title}](plans/${file})\n\n` +
          checks.map((c) => `${" ".repeat(c.indent)}- [ ] ${c.text}`).join("\n"),
      )
      .join("\n\n")
  : "残検証なし。";

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

## 残検証

\`${VERIFYING}\` の Plan に残っている未チェック項目を全 Plan から集めたもの。
**検証の真実源は各 Plan のチェックボックス**で、この節はその投影。消化したら対応 Plan の
チェックボックスを更新して再生成する（別途チェックリストを作らない）。

${pendingSection}
`;

if (warnings.length) {
  console.error("ステータスと検証チェックの不整合:");
  for (const w of warnings) console.error("  - " + w);
}

// 共通の接頭辞・接尾辞を除いた「食い違っている範囲」だけを出す。
function driftReport(current, generated, maxLines = 40) {
  const a = current.split("\n");
  const b = generated.split("\n");
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let tail = 0;
  while (
    tail < a.length - head &&
    tail < b.length - head &&
    a[a.length - 1 - tail] === b[b.length - 1 - tail]
  )
    tail++;
  const clip = (lines, from) =>
    lines.slice(0, maxLines).map((l, i) => `${from + i + 1}: ${l}`);
  const cur = clip(a.slice(head, a.length - tail), head);
  const gen = clip(b.slice(head, b.length - tail), head);
  return [
    `--- コミット済み outputs/README.md (${cur.length} 行)`,
    ...cur,
    `+++ Plan ヘッダから生成した内容 (${gen.length} 行)`,
    ...gen,
  ].join("\n");
}

if (toCheck) {
  const current = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
  if (current === out) {
    console.log(`outputs/README.md は最新（${rows.length} Plan）`);
  } else {
    console.error(
      `${ciPrefix}outputs/README.md が Plan ヘッダと一致しません。` +
        `node scripts/gen-outputs-readme.mjs を実行してコミットしてください`,
    );
    console.error(driftReport(current, out));
    process.exit(2);
  }
} else if (toStdout) process.stdout.write(out);
else {
  writeFileSync(readmePath, out);
  console.log(
    `outputs/README.md を生成（${rows.length} Plan / 残検証 ${pending.length} Plan）`,
  );
}
