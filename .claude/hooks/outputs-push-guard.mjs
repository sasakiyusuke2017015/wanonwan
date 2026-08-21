// PreToolUse(Bash) hook: develop 上での git push を事前検査する。
// outputs/** 例外規定（.claude/rules/git-workflow.md）の外の変更が含まれていれば
// exit 2 で push をブロックする。それ以外は素通し（exit 0）。
//
// - 全 Bash 呼び出しに掛かるため、push 以外は substring 判定で最速で抜ける
// - 判定はローカルの origin/develop 参照に対して行う（fetch しない = 高速・オフライン可）。
//   参照が古い場合の取りこぼしは CI 側の Direct push guard が事後検知する（多層防御）
// - Windows でも動くよう Node で書く（bash 依存にしない）
import { execFileSync } from "node:child_process";

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  if (!input.includes("git push")) process.exit(0);
  let cmd = "";
  try {
    cmd = JSON.parse(input).tool_input?.command ?? "";
  } catch {
    process.exit(0);
  }
  if (!/git\s+push/.test(cmd)) process.exit(0);

  const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
  let branch = "";
  try {
    branch = git("symbolic-ref", "--short", "HEAD");
  } catch {
    process.exit(0); // detached HEAD 等は対象外
  }
  if (branch !== "develop") process.exit(0);

  let files = [];
  try {
    files = git("diff", "--name-only", "origin/develop", "HEAD").split("\n").filter(Boolean);
  } catch {
    process.exit(0); // origin/develop 不在等は CI に委ねる
  }
  const allowed = [/^outputs\/README\.md$/, /^outputs\/plans\//, /^outputs\/reviews\//];
  const bad = files.filter((f) => !allowed.some((re) => re.test(f)));
  if (bad.length === 0) process.exit(0);

  console.error("✗ develop への直 push をブロック: outputs/** 例外規定外の変更が含まれています");
  for (const f of bad.slice(0, 10)) console.error(`    ${f}`);
  if (bad.length > 10) console.error(`    …他 ${bad.length - 10} ファイル`);
  console.error("  feature ブランチ + PR で出し直してください（.claude/rules/git-workflow.md）");
  process.exit(2);
});
