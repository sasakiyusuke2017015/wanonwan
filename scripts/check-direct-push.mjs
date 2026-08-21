// develop への直 push が outputs/** の例外規定に収まっているかを検査する。
// 使い方: node scripts/check-direct-push.mjs <before> <after>
//   before/after は push イベントの commit 範囲（github.event.before / .after）。
// 終了コード: 0 = 違反なし / 1 = 違反あり / 0(警告) = 範囲を検査できない force push 等
//
// 「outputs/** だけが変更ファイルの commit」だけが develop 直 push 可
// （.claude/rules/git-workflow.md の例外規定）。それ以外は feature ブランチ + PR。
//
// 判定:
// - first-parent 系列のみ walk する（PR の feature commit は second-parent 側）
// - 親 1 つ = 直 push commit → 変更ファイルが許可パスのみか検査
// - 親 2 つ以上 = committer が noreply@github.com（GitHub UI マージの署名）のときだけ
//   PR マージとして skip。ユーザー committer の merge（ローカル git merge の直 push）は
//   PR を経ていないので違反として報告する
import { execFileSync } from "node:child_process";

const ALLOWED = [/^outputs\/README\.md$/, /^outputs\/plans\//, /^outputs\/reviews\//];
const ZERO = /^0{40}$/;

const [before, after] = process.argv.slice(2);
if (!before || !after) {
  console.error("使い方: node scripts/check-direct-push.mjs <before> <after>");
  process.exit(2);
}

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 }).trim();

if (ZERO.test(before)) {
  console.log("⚠ before が全ゼロ（新規 ref）。検査をスキップします");
  process.exit(0);
}
try {
  git("merge-base", "--is-ancestor", before, after);
} catch {
  console.log("⚠ before が after の祖先ではない（force push / 履歴改変）。検査をスキップします");
  process.exit(0);
}

// first-parent 系列の commit を「hash 親リスト committer-email」で列挙
const lines = git("rev-list", "--first-parent", "--format=%H %P|%ce", `${before}..${after}`)
  .split("\n")
  .filter((l) => l && !l.startsWith("commit "));

const violations = [];
for (const line of lines) {
  const [shaAndParents, committer] = line.split("|");
  const [sha, ...parents] = shaAndParents.trim().split(" ").filter(Boolean);

  if (parents.length >= 2) {
    if (committer === "noreply@github.com") continue; // GitHub UI の PR マージ
    violations.push({ sha, reason: "ローカル merge の直 push（PR を経ていない）", files: [] });
    continue;
  }

  const files = git("diff-tree", "--no-commit-id", "--name-only", "-r", sha)
    .split("\n")
    .filter(Boolean);
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  if (outside.length) {
    violations.push({ sha, reason: "outputs/** 以外を含む直 push", files: outside });
  }
}

if (violations.length === 0) {
  console.log(`✓ 直 push は outputs/** の例外規定内（検査 ${lines.length} commit）`);
  process.exit(0);
}

const ci = process.env.GITHUB_ACTIONS ? "::error::" : "";
console.error(
  `${ci}develop への直 push が outputs/** の例外規定に違反しています。` +
    `該当変更は feature ブランチ + PR で出し直してください（.claude/rules/git-workflow.md）`,
);
for (const v of violations) {
  const subject = git("log", "-1", "--format=%s", v.sha);
  console.error(`  - ${v.sha.slice(0, 7)} ${subject}`);
  console.error(`    ${v.reason}`);
  for (const f of v.files.slice(0, 10)) console.error(`      ${f}`);
  if (v.files.length > 10) console.error(`      …他 ${v.files.length - 10} ファイル`);
}
process.exit(1);
